// ToDo - изучить

import fs from 'node:fs'
import path from 'node:path'
import { NativeHostErrorCode } from '#native-protocol'
import { NativeHostError } from '../../shared/errors/native-host.error.js'
import type { IdeAdapter } from './ide-adapter.types.js'

const getWindowsVsCodeCandidates = (): string[] => {
  const candidateRoots = [
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs'),
    process.env.PROGRAMFILES,
    process.env['PROGRAMFILES(X86)'],
  ].filter((value): value is string => typeof value === 'string' && value.length > 0)

  return candidateRoots.flatMap((root) => [
    path.join(root, 'Microsoft VS Code', 'Code.exe'),
    path.join(root, 'Microsoft VS Code Insiders', 'Code - Insiders.exe'),
  ])
}

const findExistingFile = (filePaths: string[]): string | undefined =>
  filePaths.find((filePath) => fs.existsSync(filePath))

export const resolveIdeCommand = (
  ide: string,
  adapter: IdeAdapter,
): { command: string; source: 'detected' | 'default' } => {
  if (ide === 'vscode' && process.platform === 'win32') {
    const detectedCommand = findExistingFile(getWindowsVsCodeCandidates())

    if (detectedCommand) {
      return {
        command: detectedCommand,
        source: 'detected',
      }
    }

    throw new NativeHostError({
      code: NativeHostErrorCode.IdeNotFound,
      details: { ide },
    })
  }

  return {
    command: adapter.defaultCommand,
    source: 'default',
  }
}
