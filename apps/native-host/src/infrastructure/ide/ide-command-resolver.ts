import fs from 'node:fs'
import path from 'node:path'
import { NativeHostErrorCode } from '@open-with-local-ide/protocol'
import { NativeHostError } from '../../shared/errors/native-host.error.js'
import type { IdeAdapter } from './ide-adapter.types.js'

const VSCODE_EXECUTABLES = [
  { folder: 'Microsoft VS Code', launcher: 'code.cmd', executable: 'Code.exe' },
  { folder: 'Microsoft VS Code Insiders', launcher: 'code-insiders.cmd', executable: 'Code - Insiders.exe' },
]

/** Default per-user and per-machine install folders. */
const getInstallFolderCandidates = (): string[] => {
  const roots = [
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs'),
    process.env.PROGRAMFILES,
    process.env['PROGRAMFILES(X86)'],
  ].filter((root): root is string => Boolean(root))

  return roots.flatMap((root) =>
    VSCODE_EXECUTABLES.map(({ folder, executable }) => path.join(root, folder, executable)),
  )
}

/**
 * Installs elsewhere put `<install>\bin\code.cmd` on PATH. The `.cmd` launcher cannot be spawned
 * without a shell, so the executable next to its `bin` folder is used instead.
 */
const getPathCandidates = (): string[] => {
  const pathDirectories = (process.env.PATH ?? '').split(path.delimiter).filter(Boolean)

  return pathDirectories.flatMap((directory) =>
    VSCODE_EXECUTABLES.filter(({ launcher }) => fs.existsSync(path.join(directory, launcher))).map(({ executable }) =>
      path.resolve(directory, '..', executable),
    ),
  )
}

export const resolveIdeCommand = (
  ide: string,
  adapter: IdeAdapter,
): { command: string; source: 'detected' | 'default' } => {
  if (ide !== 'vscode' || process.platform !== 'win32') {
    return { command: adapter.defaultCommand, source: 'default' }
  }

  const command = [...getInstallFolderCandidates(), ...getPathCandidates()].find((candidate) =>
    fs.existsSync(candidate),
  )
  if (!command) throw new NativeHostError({ code: NativeHostErrorCode.IdeNotFound, details: { ide } })

  return { command, source: 'detected' }
}
