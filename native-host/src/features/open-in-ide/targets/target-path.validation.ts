import fs from 'node:fs'
import path from 'node:path'
import { NativeHostErrorCode } from '#native-protocol'
import { NativeHostError } from '../../../shared/errors/native-host.error.js'

export const isInsideDirectory = (parentPath: string, childPath: string): boolean => {
  const normalizedParentPath = process.platform === 'win32' ? parentPath.toLowerCase() : parentPath
  const normalizedChildPath = process.platform === 'win32' ? childPath.toLowerCase() : childPath
  const relativePath = path.relative(normalizedParentPath, normalizedChildPath)

  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
}

const isDriveRelativePath = (targetPath: string): boolean => /^[a-zA-Z]:(?![\\/])/.test(targetPath)

export const isRelativeTargetPath = (targetPath: string): boolean =>
  !path.isAbsolute(targetPath) &&
  !path.posix.isAbsolute(targetPath) &&
  !path.win32.isAbsolute(targetPath) &&
  !isDriveRelativePath(targetPath)

export const getRealPath = (
  targetPath: string,
  error:
    | {
        code: NativeHostErrorCode.RepoPathNotFound
        details: { repoPath: string }
      }
    | {
        code: NativeHostErrorCode.FileNotFound
        details: { filePath: string }
      }
    | {
        code: NativeHostErrorCode.DirectoryNotFound
        details: { directoryPath: string }
      },
): string => {
  try {
    return fs.realpathSync(targetPath)
  } catch {
    throw new NativeHostError(error)
  }
}
