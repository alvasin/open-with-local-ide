import { z } from 'zod'
import { NativeHostErrorCode } from '#native-protocol'
import { NativeHostError } from '../../shared/errors/native-host.error.js'
import { validateDirectoryTarget } from './targets/directory-target.validation.js'
import { validateFileTarget } from './targets/file-target.validation.js'
import { validateRepositoryTarget } from './targets/repository-target.validation.js'
import type { NativeOpenInIdeRequest, ValidOpenInIdeRequest } from './open-in-ide.types.js'

const repositoryTargetSchema = z
  .object({
    kind: z.literal('repository'),
  })
  .strict()

const fileTargetSchema = z
  .object({
    kind: z.literal('file'),
    filePath: z.string().trim().min(1),
    line: z.number().int().positive().optional(),
  })
  .strict()

const directoryTargetSchema = z
  .object({
    kind: z.literal('directory'),
    directoryPath: z.string().trim().min(1),
  })
  .strict()

export const openInIdeRequestSchema = z
  .object({
    action: z.literal('openInIde'),
    repoPath: z.string().trim().min(1),
    ide: z.literal('vscode').default('vscode'),
    repoKey: z.string().trim().min(1).optional(),
    provider: z.literal('github').optional(),
    target: z.discriminatedUnion('kind', [
      repositoryTargetSchema,
      directoryTargetSchema,
      fileTargetSchema,
    ]),
  })
  .strict()

const parseOpenInIdeRequest = (message: unknown): NativeOpenInIdeRequest => {
  const parsedMessage = openInIdeRequestSchema.safeParse(message)
  if (parsedMessage.success) return parsedMessage.data

  throw new NativeHostError({ code: NativeHostErrorCode.InvalidMessage })
}

export const validateOpenInIdeRequest = (message: unknown): ValidOpenInIdeRequest => {
  const request = parseOpenInIdeRequest(message)
  const repoPath = validateRepositoryTarget(request.repoPath)

  if (request.target.kind === 'repository') {
    return {
      ...request,
      repoPath,
      target: request.target,
    }
  }

  if (request.target.kind === 'directory') {
    return {
      ...request,
      repoPath,
      target: {
        ...request.target,
        resolvedPath: validateDirectoryTarget(repoPath, request.target.directoryPath),
      },
    }
  }

  return {
    ...request,
    repoPath,
    target: {
      ...request.target,
      resolvedPath: validateFileTarget(repoPath, request.target.filePath),
    },
  }
}
