import { spawn } from 'node:child_process'
import { NativeHostErrorCode } from '#native-protocol'
import { resolveIdeCommand } from './ide-command-resolver.js'
import { IDE_ADAPTERS } from './ide-adapters.registry.js'
import type { ValidOpenInIdeRequest } from '../../features/open-in-ide/open-in-ide.types.js'
import { log, logError } from '../logging/logger.js'
import { NativeHostError } from '../../shared/errors/native-host.error.js'

export const launchTargetInIde = async (request: ValidOpenInIdeRequest): Promise<void> => {
  const adapter = IDE_ADAPTERS[request.ide]
  if (!adapter) {
    throw new NativeHostError({
      code: NativeHostErrorCode.IdeNotSupported,
      details: { ide: request.ide },
    })
  }

  const commandResolution = resolveIdeCommand(request.ide, adapter)
  const command = commandResolution.command

  const args =
    request.target.kind === 'file'
      ? adapter.buildFileInRepositoryArgs({
          resolvedPath: request.target.resolvedPath,
          repoPath: request.repoPath,
          line: request.target.line,
        })
      : adapter.buildRepositoryArgs({
          repoPath:
            request.target.kind === 'directory' ? request.target.resolvedPath : request.repoPath,
        })

  log({
    event: 'ide.spawn',
    ide: request.ide,
    commandSource: commandResolution.source,
  })

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      shell: false,
      detached: true,
      stdio: 'ignore',
    })

    child.once('error', (error) => {
      logError(error, {
        event: 'ide.spawn.error',
        ide: request.ide,
        commandSource: commandResolution.source,
      })

      reject(
        new NativeHostError({
          code: NativeHostErrorCode.IdeLaunchFailed,
          details: { ide: request.ide, message: error.message },
        }),
      )
    })

    child.once('spawn', () => {
      child.unref()

      log({
        event: 'ide.spawn.success',
        ide: request.ide,
        commandSource: commandResolution.source,
      })

      resolve()
    })
  })
}
