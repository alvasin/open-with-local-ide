import { spawn } from 'node:child_process'
import { NativeHostErrorCode, type OpenInIdeTarget, type ParsedOpenInIdeRequest } from '@open-with-local-ide/protocol'
import { resolveIdeCommand } from './ide-command-resolver.js'
import { IDE_ADAPTERS } from './ide-adapters.registry.js'
import { log, logError } from '../logging/logger.js'
import { NativeHostError } from '../../shared/errors/native-host.error.js'

/** A validated open request: everything needed to launch the IDE. */
export type IdeLaunchTarget = {
  ide: ParsedOpenInIdeRequest['ide']
  kind: OpenInIdeTarget['kind']
  /** Absolute repository path. */
  repoPath: string
  /** Absolute path to open: the repository itself, a folder, or a file inside it. */
  targetPath: string
  /** Line to jump to; files only. */
  line?: number
}

export const launchTargetInIde = async (request: IdeLaunchTarget): Promise<void> => {
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
    request.kind === 'file'
      ? adapter.buildFileInRepositoryArgs({
          resolvedPath: request.targetPath,
          repoPath: request.repoPath,
          line: request.line,
        })
      : adapter.buildRepositoryArgs({ repoPath: request.targetPath })

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
