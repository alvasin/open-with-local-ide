import {
  NativeHostErrorCode,
  openInIdeRequestSchema,
  type ParsedOpenInIdeRequest,
} from '@open-with-local-ide/protocol'
import { NativeHostError } from '../../shared/errors/native-host.error.js'
import { validateDirectoryTarget } from './targets/directory-target.validation.js'
import { validateFileTarget } from './targets/file-target.validation.js'
import { validateRepositoryTarget } from './targets/repository-target.validation.js'
import type { ValidOpenInIdeRequest } from './open-in-ide.types.js'

const parseOpenInIdeRequest = (message: unknown): ParsedOpenInIdeRequest => {
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
