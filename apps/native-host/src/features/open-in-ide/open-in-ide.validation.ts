import { NativeHostErrorCode, openInIdeRequestSchema, type ParsedOpenInIdeRequest } from '@open-with-local-ide/protocol'
import type { IdeLaunchTarget } from '../../infrastructure/ide/ide-runner.js'
import { NativeHostError } from '../../shared/errors/native-host.error.js'
import { validateRepositoryTarget } from './targets/repository-target.validation.js'
import { validateTargetPath } from './targets/target-path.validation.js'

const parseOpenInIdeRequest = (message: unknown): ParsedOpenInIdeRequest => {
  const parsedMessage = openInIdeRequestSchema.safeParse(message)
  if (parsedMessage.success) return parsedMessage.data

  throw new NativeHostError({ code: NativeHostErrorCode.InvalidMessage })
}

/** Validates the request and resolves which local path to open. */
export const validateOpenInIdeRequest = (message: unknown): IdeLaunchTarget => {
  const { ide, repoPath: requestedRepoPath, target } = parseOpenInIdeRequest(message)
  const repoPath = validateRepositoryTarget(requestedRepoPath)

  switch (target.kind) {
    case 'repository':
      return { ide, kind: target.kind, repoPath, targetPath: repoPath }
    case 'directory':
      return {
        ide,
        kind: target.kind,
        repoPath,
        targetPath: validateTargetPath(repoPath, target.directoryPath, 'directory'),
      }
    case 'file':
      return {
        ide,
        kind: target.kind,
        repoPath,
        targetPath: validateTargetPath(repoPath, target.filePath, 'file'),
        line: target.line,
      }
  }
}
