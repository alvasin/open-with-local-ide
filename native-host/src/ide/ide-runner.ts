import { spawn } from 'node:child_process'
import { NativeHostErrorCode } from '#native-protocol'
import { resolveIdeCommand } from './ide-command-resolver.js'
import { IDE_ADAPTERS } from './ide-adapters.registry.js'
import { NativeHostError } from '../native-messaging/native-message.types.js'
import type { ValidOpenFileRequest } from '../open-file/open-file.types.js'
import { log, logError } from '../utils/logger.js'

export const openFileInIde = async (request: ValidOpenFileRequest): Promise<void> => {
  const adapter = IDE_ADAPTERS[request.ide]
  if (!adapter) {
    throw new NativeHostError({
      code: NativeHostErrorCode.IdeNotSupported,
      details: { ide: request.ide },
    })
  }

  const commandResolution = resolveIdeCommand(request.ide, adapter)
  const command = commandResolution.command

  const buildArgs = request.openMode === 'file' ? adapter.buildFileArgs : adapter.buildWorkspaceArgs
  const args = buildArgs({
    resolvedPath: request.resolvedPath,
    repoPath: request.repoPath,
    line: request.line,
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
