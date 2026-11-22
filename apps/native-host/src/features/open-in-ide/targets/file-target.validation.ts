import path from 'node:path'
import { NativeHostErrorCode } from '@open-with-local-ide/protocol'
import { NativeHostError } from '../../../shared/errors/native-host.error.js'
import { getRealPath, isInsideDirectory, isRelativeTargetPath } from './target-path.validation.js'

export const validateFileTarget = (repoPath: string, filePath: string): string => {
  if (filePath.includes('\0') || !isRelativeTargetPath(filePath)) {
    throw new NativeHostError({
      code: NativeHostErrorCode.FilePathMustBeRelative,
      details: { filePath },
    })
  }

  const resolvedPath = path.resolve(repoPath, filePath)

  if (!isInsideDirectory(repoPath, resolvedPath)) {
    throw new NativeHostError({
      code: NativeHostErrorCode.PathTraversalDetected,
      details: { filePath },
    })
  }

  const realRepoPath = getRealPath(repoPath, {
    code: NativeHostErrorCode.RepoPathNotFound,
    details: { repoPath },
  })
  const realTargetPath = getRealPath(resolvedPath, {
    code: NativeHostErrorCode.FileNotFound,
    details: { filePath },
  })

  if (!isInsideDirectory(realRepoPath, realTargetPath)) {
    throw new NativeHostError({
      code: NativeHostErrorCode.PathTraversalDetected,
      details: { filePath },
    })
  }

  return resolvedPath
}
