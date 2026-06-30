import fs from 'node:fs'
import path from 'node:path'
import { NativeHostErrorCode } from '#native-protocol'
import { NativeHostError } from '../../../shared/errors/native-host.error.js'

const getDirectoryStats = (directoryPath: string): fs.Stats => {
  try {
    return fs.statSync(directoryPath)
  } catch {
    throw new NativeHostError({
      code: NativeHostErrorCode.RepoPathNotFound,
      details: { repoPath: directoryPath },
    })
  }
}

export const validateRepositoryTarget = (repoPath: string): string => {
  if (!path.isAbsolute(repoPath)) {
    throw new NativeHostError({
      code: NativeHostErrorCode.RepoPathMustBeAbsolute,
      details: { repoPath },
    })
  }

  const resolvedRepoPath = path.resolve(repoPath)
  const repoStats = getDirectoryStats(resolvedRepoPath)

  if (!repoStats.isDirectory()) {
    throw new NativeHostError({
      code: NativeHostErrorCode.RepoPathNotDirectory,
      details: { repoPath: resolvedRepoPath },
    })
  }

  return resolvedRepoPath
}
