import fs from 'node:fs'
import path from 'node:path'
import { NativeHostErrorCode } from '#native-protocol'
import { NativeHostError } from '../../../shared/errors/native-host.error.js'
import { getRealPath, isInsideDirectory, isRelativeTargetPath } from './target-path.validation.js'

export const validateDirectoryTarget = (repoPath: string, directoryPath: string): string => {
  if (directoryPath.includes('\0') || !isRelativeTargetPath(directoryPath)) {
    throw new NativeHostError({
      code: NativeHostErrorCode.DirectoryPathMustBeRelative,
      details: { directoryPath },
    })
  }

  const resolvedPath = path.resolve(repoPath, directoryPath)

  if (!isInsideDirectory(repoPath, resolvedPath)) {
    throw new NativeHostError({
      code: NativeHostErrorCode.PathTraversalDetected,
      details: { filePath: directoryPath },
    })
  }

  const realRepoPath = getRealPath(repoPath, {
    code: NativeHostErrorCode.RepoPathNotFound,
    details: { repoPath },
  })
  const realTargetPath = getRealPath(resolvedPath, {
    code: NativeHostErrorCode.DirectoryNotFound,
    details: { directoryPath },
  })

  if (!isInsideDirectory(realRepoPath, realTargetPath)) {
    throw new NativeHostError({
      code: NativeHostErrorCode.PathTraversalDetected,
      details: { filePath: directoryPath },
    })
  }

  if (!fs.statSync(realTargetPath).isDirectory()) {
    throw new NativeHostError({
      code: NativeHostErrorCode.DirectoryPathNotDirectory,
      details: { directoryPath },
    })
  }

  return resolvedPath
}
