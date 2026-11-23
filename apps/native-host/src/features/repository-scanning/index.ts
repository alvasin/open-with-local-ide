import fs from 'node:fs'
import path from 'node:path'
import {
  NativeHostErrorCode,
  type DiscoveredRepository,
  type ScanRepositoriesSuccessResponse,
  type ScanSkippedEntry,
  type ScanSkippedReason,
} from '@open-with-local-ide/protocol'
import { NativeHostError } from '../../shared/errors/native-host.error.js'
import { parseGitRemotes, type GitRemote } from './git-config.parser.js'
import { parseGitHubRemote } from './github-remote.parser.js'
import { validateScanRepositoriesRequest } from './scan-repositories.validation.js'

const SKIPPED_DIR_NAMES = new Set([
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
])

/** What a single directory turned out to be. */
type DirectoryCheck =
  | { kind: 'not-a-repository' }
  | { kind: 'repository'; repository: DiscoveredRepository }
  | { kind: 'skipped'; reason: ScanSkippedReason }

/**
 * Returns the Git directory of `repoPath` (a `.git` directory, or the target of a `.git` file used
 * by worktrees and submodules), or `null` when the directory is not a repository.
 */
const findGitDirectory = (repoPath: string): string | null => {
  const dotGitPath = path.join(repoPath, '.git')
  let stats: fs.Stats

  try {
    stats = fs.lstatSync(dotGitPath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }

  if (stats.isDirectory()) return dotGitPath
  if (!stats.isFile()) throw new Error('Unsupported .git entry')

  const gitDir = fs.readFileSync(dotGitPath, 'utf8').match(/^\s*gitdir:\s*(.+?)\s*$/i)?.[1]
  if (!gitDir) throw new Error('Invalid .git file')

  return path.resolve(repoPath, gitDir)
}

/** Worktrees keep the shared config in the directory named by their `commondir` file. */
const findGitConfig = (gitDirectory: string): string | null => {
  const directConfig = path.join(gitDirectory, 'config')
  if (fs.existsSync(directConfig)) return directConfig

  const commonDirFile = path.join(gitDirectory, 'commondir')
  if (!fs.existsSync(commonDirFile)) return null

  const commonDirectory = path.resolve(gitDirectory, fs.readFileSync(commonDirFile, 'utf8').trim())
  const commonConfig = path.join(commonDirectory, 'config')
  return fs.existsSync(commonConfig) ? commonConfig : null
}

/** Picks the first GitHub remote, preferring `origin`. */
const pickGitHubRemote = (remotes: GitRemote[]) => {
  const githubRemotes = remotes.flatMap((remote) => {
    const github = parseGitHubRemote(remote.url)
    return github ? [{ name: remote.name, ...github }] : []
  })

  return githubRemotes.find((remote) => remote.name === 'origin') ?? githubRemotes[0]
}

const checkDirectory = (directoryPath: string): DirectoryCheck => {
  let remotes: GitRemote[]

  try {
    const gitDirectory = findGitDirectory(directoryPath)
    if (!gitDirectory) return { kind: 'not-a-repository' }

    const configPath = findGitConfig(gitDirectory)
    if (!configPath) return { kind: 'skipped', reason: 'missing_git_config' }

    remotes = parseGitRemotes(fs.readFileSync(configPath, 'utf8'))
  } catch {
    return { kind: 'skipped', reason: 'invalid_git_config' }
  }

  if (remotes.length === 0) return { kind: 'skipped', reason: 'missing_remote' }

  const remote = pickGitHubRemote(remotes)
  if (!remote) return { kind: 'skipped', reason: 'unsupported_remote' }

  return {
    kind: 'repository',
    repository: {
      provider: 'github',
      owner: remote.owner,
      repo: remote.repo,
      repoPath: directoryPath,
      remoteName: remote.name,
    },
  }
}

/** Subdirectories worth descending into: no symlinks, no `.git`, no dependency or build output. */
const listChildDirectories = (directoryPath: string): string[] =>
  fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.isSymbolicLink() &&
        entry.name !== '.git' &&
        !SKIPPED_DIR_NAMES.has(entry.name.toLowerCase()),
    )
    .map((entry) => path.join(directoryPath, entry.name))

const readErrorReason = (error: unknown): ScanSkippedReason => {
  const code = (error as NodeJS.ErrnoException).code
  return code === 'EACCES' || code === 'EPERM' ? 'permission_denied' : 'unknown_error'
}

/**
 * Walks the root folder and collects repositories with a GitHub remote. Repositories are not
 * descended into, and a failure in one directory only adds a skipped entry.
 */
export const scanRepositories = (message: unknown): ScanRepositoriesSuccessResponse => {
  const { rootPath, maxDepth } = validateScanRepositoriesRequest(message)
  const repositories: DiscoveredRepository[] = []
  const skipped: ScanSkippedEntry[] = []

  const visit = (directoryPath: string, depth: number) => {
    const check = checkDirectory(directoryPath)

    if (check.kind === 'repository') {
      repositories.push(check.repository)
      return
    }

    if (check.kind === 'skipped') {
      skipped.push({ path: directoryPath, reason: check.reason })
      return
    }

    let children: string[]
    try {
      children = listChildDirectories(directoryPath)
    } catch (error) {
      skipped.push({ path: directoryPath, reason: readErrorReason(error) })
      return
    }

    if (depth >= maxDepth) {
      if (children.length > 0) skipped.push({ path: directoryPath, reason: 'scan_depth_exceeded' })
      return
    }

    for (const child of children) visit(child, depth + 1)
  }

  try {
    visit(rootPath, 0)
  } catch {
    throw new NativeHostError({ code: NativeHostErrorCode.ScanFailed })
  }

  return { ok: true, repositories, skipped }
}
