import fs from 'node:fs'
import path from 'node:path'
import { NativeHostErrorCode, type NativeHostErrorData } from '@open-with-local-ide/protocol'
import { NativeHostError } from '../../../shared/errors/native-host.error.js'

type TargetKind = 'file' | 'directory'

const TARGET_ERROR_CODES = {
  file: {
    mustBeRelative: NativeHostErrorCode.FilePathMustBeRelative,
    notFound: NativeHostErrorCode.FileNotFound,
  },
  directory: {
    mustBeRelative: NativeHostErrorCode.DirectoryPathMustBeRelative,
    notFound: NativeHostErrorCode.DirectoryNotFound,
  },
} satisfies Record<TargetKind, Record<string, NativeHostErrorCode>>

const isInsideDirectory = (parentPath: string, childPath: string): boolean => {
  const normalizedParentPath = process.platform === 'win32' ? parentPath.toLowerCase() : parentPath
  const normalizedChildPath = process.platform === 'win32' ? childPath.toLowerCase() : childPath
  const relativePath = path.relative(normalizedParentPath, normalizedChildPath)

  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
}

const isDriveRelativePath = (targetPath: string): boolean => /^[a-zA-Z]:(?![\\/])/.test(targetPath)

const isRelativeTargetPath = (targetPath: string): boolean =>
  !path.isAbsolute(targetPath) &&
  !path.posix.isAbsolute(targetPath) &&
  !path.win32.isAbsolute(targetPath) &&
  !isDriveRelativePath(targetPath)

const getRealPath = (targetPath: string, error: NativeHostErrorData): string => {
  try {
    return fs.realpathSync(targetPath)
  } catch {
    throw new NativeHostError(error)
  }
}

/**
 * Resolves a repository-relative file or directory path and proves it stays inside the
 * repository both lexically and after resolving symlinks.
 */
export const validateTargetPath = (repoPath: string, targetPath: string, kind: TargetKind): string => {
  const errorCodes = TARGET_ERROR_CODES[kind]
  const details = kind === 'file' ? { filePath: targetPath } : { directoryPath: targetPath }

  if (targetPath.includes('\0') || !isRelativeTargetPath(targetPath)) {
    throw new NativeHostError({ code: errorCodes.mustBeRelative, details })
  }

  const resolvedPath = path.resolve(repoPath, targetPath)

  if (!isInsideDirectory(repoPath, resolvedPath)) {
    throw new NativeHostError({ code: NativeHostErrorCode.PathTraversalDetected, details })
  }

  const realRepoPath = getRealPath(repoPath, {
    code: NativeHostErrorCode.RepoPathNotFound,
    details: { repoPath },
  })
  const realTargetPath = getRealPath(resolvedPath, { code: errorCodes.notFound, details })

  if (!isInsideDirectory(realRepoPath, realTargetPath)) {
    throw new NativeHostError({ code: NativeHostErrorCode.PathTraversalDetected, details })
  }

  if (kind === 'directory' && !fs.statSync(realTargetPath).isDirectory()) {
    throw new NativeHostError({ code: NativeHostErrorCode.DirectoryPathNotDirectory, details })
  }

  return resolvedPath
}
