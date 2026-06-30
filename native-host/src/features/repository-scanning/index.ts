import fs from 'node:fs'
import path from 'node:path'
import type {
  DiscoveredRepository,
  ScanRepositoriesSuccessResponse,
  ScanSkippedEntry,
} from '#native-protocol'
import { NativeHostErrorCode } from '#native-protocol'
import { NativeHostError } from '../../shared/errors/native-host.error.js'
import { parseGitRemotes } from './git-config.parser.js'
import { parseGitHubRemote } from './github-remote.parser.js'
import {
  validateScanRepositoriesRequest,
  type ValidScanRepositoriesRequest,
} from './scan-repositories.validation.js'

const SKIPPED_DIR_NAMES = new Set(
  [
    'node_modules',
    '.cache',
    '.pnpm-store',
    '.yarn',
    'dist',
    'build',
    'coverage',
    '.next',
    '.nuxt',
    'appdata',
  ].map((name) => name.toLowerCase()),
)

type GitDirectoryResult = { found: false } | { found: true; gitDirectory?: string }

const readGitDirectory = (repoPath: string): GitDirectoryResult => {
  const dotGitPath = path.join(repoPath, '.git')
  let stats: fs.Stats

  try {
    stats = fs.lstatSync(dotGitPath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { found: false }
    throw error
  }

  if (stats.isDirectory()) return { found: true, gitDirectory: dotGitPath }
  if (!stats.isFile()) return { found: true }

  const match = fs.readFileSync(dotGitPath, 'utf8').match(/^\s*gitdir:\s*(.+?)\s*$/i)
  if (!match?.[1]) return { found: true }

  return { found: true, gitDirectory: path.resolve(repoPath, match[1]) }
}

const findGitConfig = (gitDirectory: string): string | null => {
  const directConfig = path.join(gitDirectory, 'config')
  if (fs.existsSync(directConfig)) return directConfig

  const commonDirFile = path.join(gitDirectory, 'commondir')
  if (!fs.existsSync(commonDirFile)) return null

  const commonDirectory = path.resolve(gitDirectory, fs.readFileSync(commonDirFile, 'utf8').trim())
  const commonConfig = path.join(commonDirectory, 'config')
  return fs.existsSync(commonConfig) ? commonConfig : null
}

const discoverRepository = (
  repoPath: string,
  skipped: ScanSkippedEntry[],
): DiscoveredRepository | null | undefined => {
  let gitDirectoryResult: GitDirectoryResult
  try {
    gitDirectoryResult = readGitDirectory(repoPath)
  } catch {
    skipped.push({ path: repoPath, reason: 'invalid_git_config' })
    return null
  }

  if (!gitDirectoryResult.found) return undefined
  if (!gitDirectoryResult.gitDirectory) {
    skipped.push({ path: repoPath, reason: 'invalid_git_config' })
    return null
  }

  let configPath: string | null
  try {
    configPath = findGitConfig(gitDirectoryResult.gitDirectory)
  } catch {
    skipped.push({ path: repoPath, reason: 'invalid_git_config' })
    return null
  }

  if (!configPath) {
    skipped.push({ path: repoPath, reason: 'missing_git_config' })
    return null
  }

  let remotes
  try {
    remotes = parseGitRemotes(fs.readFileSync(configPath, 'utf8'))
  } catch {
    skipped.push({ path: repoPath, reason: 'invalid_git_config' })
    return null
  }

  if (remotes.length === 0) {
    skipped.push({ path: repoPath, reason: 'missing_remote' })
    return null
  }

  const orderedRemotes = [...remotes].sort((left, right) => {
    if (left.name === 'origin') return -1
    if (right.name === 'origin') return 1
    return 0
  })

  for (const remote of orderedRemotes) {
    const parsedRemote = parseGitHubRemote(remote.url)
    if (!parsedRemote) continue

    return {
      provider: 'github',
      owner: parsedRemote.owner,
      repo: parsedRemote.repo,
      repoPath,
      remoteName: remote.name,
    }
  }

  skipped.push({ path: repoPath, reason: 'unsupported_remote' })
  return null
}

const scanDirectory = (
  directoryPath: string,
  depth: number,
  request: ValidScanRepositoriesRequest,
  repositories: DiscoveredRepository[],
  skipped: ScanSkippedEntry[],
): void => {
  const repository = discoverRepository(directoryPath, skipped)
  if (repository !== undefined) {
    if (repository) repositories.push(repository)
    return
  }

  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(directoryPath, { withFileTypes: true })
  } catch (error) {
    const reason =
      (error as NodeJS.ErrnoException).code === 'EACCES' ||
      (error as NodeJS.ErrnoException).code === 'EPERM'
        ? 'permission_denied'
        : 'unknown_error'
    skipped.push({ path: directoryPath, reason })
    return
  }

  const childDirectories = entries.filter(
    (entry) =>
      entry.isDirectory() &&
      !entry.isSymbolicLink() &&
      entry.name !== '.git' &&
      !SKIPPED_DIR_NAMES.has(entry.name.toLowerCase()),
  )

  if (depth >= request.maxDepth) {
    if (childDirectories.length > 0) {
      skipped.push({ path: directoryPath, reason: 'scan_depth_exceeded' })
    }
    return
  }

  for (const entry of childDirectories) {
    scanDirectory(path.join(directoryPath, entry.name), depth + 1, request, repositories, skipped)
  }
}

export const scanRepositories = (message: unknown): ScanRepositoriesSuccessResponse => {
  const request = validateScanRepositoriesRequest(message)
  const repositories: DiscoveredRepository[] = []
  const skipped: ScanSkippedEntry[] = []

  try {
    scanDirectory(request.rootPath, 0, request, repositories, skipped)
  } catch {
    throw new NativeHostError({ code: NativeHostErrorCode.ScanFailed })
  }

  return { ok: true, repositories, skipped }
}
