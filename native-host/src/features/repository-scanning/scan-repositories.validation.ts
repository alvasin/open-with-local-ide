import fs from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { NativeHostErrorCode, type ScanRepositoriesRequest } from '#native-protocol'
import { NativeHostError } from '../../shared/errors/native-host.error.js'

const DEFAULT_MAX_DEPTH = 4

const scanRepositoriesRequestSchema = z
  .object({
    action: z.literal('scanRepositories'),
    rootPath: z.string().trim().min(1),
    maxDepth: z.number().int().min(0).max(8).optional(),
  })
  .strict()

export type ValidScanRepositoriesRequest = ScanRepositoriesRequest & {
  rootPath: string
  maxDepth: number
}

const isFilesystemRoot = (rootPath: string): boolean => path.parse(rootPath).root === rootPath

export const validateScanRepositoriesRequest = (message: unknown): ValidScanRepositoriesRequest => {
  const parsed = scanRepositoriesRequestSchema.safeParse(message)
  if (!parsed.success) {
    throw new NativeHostError({ code: NativeHostErrorCode.InvalidRootPath })
  }

  const rootPath = parsed.data.rootPath
  if (!path.isAbsolute(rootPath)) {
    throw new NativeHostError({
      code: NativeHostErrorCode.RootPathNotAbsolute,
      details: { rootPath },
    })
  }

  const resolvedRootPath = path.resolve(rootPath)
  if (isFilesystemRoot(resolvedRootPath)) {
    throw new NativeHostError({
      code: NativeHostErrorCode.RootPathNotAllowed,
      details: { rootPath: resolvedRootPath },
    })
  }

  let stats: fs.Stats
  try {
    stats = fs.statSync(resolvedRootPath)
  } catch {
    throw new NativeHostError({
      code: NativeHostErrorCode.InvalidRootPath,
      details: { rootPath: resolvedRootPath },
    })
  }

  if (!stats.isDirectory()) {
    throw new NativeHostError({
      code: NativeHostErrorCode.RootPathNotDirectory,
      details: { rootPath: resolvedRootPath },
    })
  }

  return {
    action: 'scanRepositories',
    rootPath: fs.realpathSync(resolvedRootPath),
    maxDepth: parsed.data.maxDepth ?? DEFAULT_MAX_DEPTH,
  }
}
