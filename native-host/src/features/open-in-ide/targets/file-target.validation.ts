import fs from 'node:fs'
import path from 'node:path'
import { NativeHostErrorCode } from '#native-protocol'
import { NativeHostError } from '../../../shared/errors/native-host.error.js'

const isInsideDirectory = (parentPath: string, childPath: string): boolean => {
  const normalizedParentPath = process.platform === 'win32' ? parentPath.toLowerCase() : parentPath
  const normalizedChildPath = process.platform === 'win32' ? childPath.toLowerCase() : childPath
  const relativePath = path.relative(normalizedParentPath, normalizedChildPath)

  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
}

const isDriveRelativePath = (filePath: string): boolean => /^[a-zA-Z]:(?![\\/])/.test(filePath)

const isRelativeFilePath = (filePath: string): boolean =>
  !path.isAbsolute(filePath) &&
  !path.posix.isAbsolute(filePath) &&
  !path.win32.isAbsolute(filePath) &&
  !isDriveRelativePath(filePath)

const getRealPath = (
  targetPath: string,
  error:
    | {
        code: NativeHostErrorCode.RepoPathNotFound
        details: { repoPath: string }
      }
    | {
        code: NativeHostErrorCode.FileNotFound
        details: { filePath: string }
      },
): string => {
  try {
    return fs.realpathSync(targetPath)
  } catch {
    throw new NativeHostError(error)
  }
}

export const validateFileTarget = (repoPath: string, filePath: string): string => {
  if (filePath.includes('\0') || !isRelativeFilePath(filePath)) {
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
