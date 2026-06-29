import type { IdeAdapter } from './ide-adapter.types.js'

export const IDE_ADAPTERS: Record<string, IdeAdapter> = {
  vscode: {
    label: 'VS Code',
    defaultCommand: 'code',
    buildFileArgs: ({ resolvedPath, line }) => {
      if (line) return ['-g', `${resolvedPath}:${line}`]
      return [resolvedPath]
    },
    buildWorkspaceArgs: ({ resolvedPath, repoPath, line }) => {
      if (resolvedPath === repoPath) return ['--new-window', repoPath]
      if (line) return ['--new-window', repoPath, '--goto', `${resolvedPath}:${line}`]
      return ['--new-window', repoPath, resolvedPath]
    },
  },

  // TODO: add Cursor support
  // cursor: {
  //   label: 'Cursor',
  //   defaultCommand: 'cursor',
  //   buildFileArgs: ({ resolvedPath, line }) =>
  //     line ? ['-g', `${resolvedPath}:${line}`] : [resolvedPath],
  //   buildWorkspaceArgs: ({ resolvedPath, repoPath, line }) =>
  //     line
  //       ? ['--reuse-window', repoPath, '--goto', `${resolvedPath}:${line}`]
  //       : ['--reuse-window', repoPath, resolvedPath],
  // },

  // TODO: add WebStorm support
  // webstorm: {
  //   label: 'WebStorm',
  //   defaultCommand: 'webstorm',
  //   buildFileArgs: ({ resolvedPath, line }) =>
  //     line ? ['--line', String(line), resolvedPath] : [resolvedPath],
  //   buildWorkspaceArgs: ({ resolvedPath, repoPath, line }) =>
  //     line ? [repoPath, '--line', String(line), resolvedPath] : [repoPath, resolvedPath],
  // },

  // TODO: add Vim support
  // vim: {
  //   label: 'Vim',
  //   defaultCommand: 'vim',
  //   buildFileArgs: ({ resolvedPath, line }) =>
  //     line ? [`+${line}`, resolvedPath] : [resolvedPath],
  //   buildWorkspaceArgs: ({ resolvedPath, repoPath, line }) =>
  //     line ? [`+${line}`, resolvedPath] : [resolvedPath],
  // },
}
