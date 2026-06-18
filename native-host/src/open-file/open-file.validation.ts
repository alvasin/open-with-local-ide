import fs from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { NativeHostErrorCode, type NativeHostErrorData } from '#native-protocol'
import { NativeHostError } from '../native-messaging/native-message.types.js'
import type { NativeOpenFileRequest, ValidOpenFileRequest } from './open-file.types.js'

export const nativeOpenFileRequestSchema = z
  .object({
    action: z.literal('openFile'),
    repoPath: z.string().trim().min(1),
    filePath: z.string().trim().min(1),
    line: z.number().int().positive().optional(),
    ide: z.literal('vscode').default('vscode'),
    repoKey: z.string().trim().min(1).optional(),
    provider: z.string().trim().min(1).optional(),
    openMode: z.enum(['file', 'workspace']).optional(),
  })
  .strict()

const throwOpenFileError = (error: NativeHostErrorData): never => {
  throw new NativeHostError(error)
}

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

const getRepoRealPath = (repoPath: string): string => {
  try {
    return fs.realpathSync(repoPath)
  } catch {
    throw new NativeHostError({
      code: NativeHostErrorCode.RepoPathNotFound,
      details: { repoPath },
    })
  }
}

const getTargetRealPath = (targetPath: string, filePath: string): string => {
  try {
    return fs.realpathSync(targetPath)
  } catch {
    throw new NativeHostError({
      code: NativeHostErrorCode.FileNotFound,
      details: { filePath },
    })
  }
}

const parseOpenFileRequest = (message: unknown): NativeOpenFileRequest => {
  const parsedMessage = nativeOpenFileRequestSchema.safeParse(message)
  if (parsedMessage.success && parsedMessage.data) return parsedMessage.data

  throw new NativeHostError({ code: NativeHostErrorCode.InvalidMessage })
}

export const validateOpenFileRequest = (message: NativeOpenFileRequest): ValidOpenFileRequest => {
  const request = parseOpenFileRequest(message)
  const repoPath = request.repoPath
  if (!path.isAbsolute(repoPath)) {
    throwOpenFileError({
      code: NativeHostErrorCode.RepoPathMustBeAbsolute,
      details: { repoPath },
    })
  }

  const resolvedRepoPath = path.resolve(repoPath)
  const repoStats = getDirectoryStats(resolvedRepoPath)

  if (!repoStats.isDirectory()) {
    throwOpenFileError({
      code: NativeHostErrorCode.RepoPathNotDirectory,
      details: { repoPath: resolvedRepoPath },
    })
  }

  const filePath = request.filePath
  if (filePath.includes('\0') || !isRelativeFilePath(filePath)) {
    throwOpenFileError({
      code: NativeHostErrorCode.FilePathMustBeRelative,
      details: { filePath },
    })
  }

  const resolvedPath = path.resolve(resolvedRepoPath, filePath)

  if (!isInsideDirectory(resolvedRepoPath, resolvedPath)) {
    throwOpenFileError({
      code: NativeHostErrorCode.PathTraversalDetected,
      details: { filePath },
    })
  }

  const realRepoPath = getRepoRealPath(resolvedRepoPath)
  const realTargetPath = getTargetRealPath(resolvedPath, filePath)

  if (!isInsideDirectory(realRepoPath, realTargetPath)) {
    throwOpenFileError({
      code: NativeHostErrorCode.PathTraversalDetected,
      details: { filePath },
    })
  }

  return {
    action: 'openFile',
    repoPath: resolvedRepoPath,
    filePath,
    line: request.line,
    ide: request.ide,
    repoKey: request.repoKey,
    provider: request.provider,
    openMode: request.openMode,
    resolvedPath,
  }
}
