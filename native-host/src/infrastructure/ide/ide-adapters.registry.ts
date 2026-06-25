import type { IdeAdapter } from './ide-adapter.types.js'

export const IDE_ADAPTERS: Record<string, IdeAdapter> = {
  vscode: {
    label: 'VS Code',
    defaultCommand: 'code',
    buildRepositoryArgs: ({ repoPath }) => ['--new-window', repoPath],
    buildFileInRepositoryArgs: ({ resolvedPath, repoPath, line }) => {
      if (line) return ['--new-window', repoPath, '--goto', `${resolvedPath}:${line}`]
      return ['--new-window', repoPath, resolvedPath]
    },
  },

  // TODO: add Cursor support
  // cursor: {
  //   label: 'Cursor',
  //   defaultCommand: 'cursor',
  //   buildRepositoryArgs: ({ repoPath }) => ['--reuse-window', repoPath],
  //   buildFileInRepositoryArgs: ({ resolvedPath, repoPath, line }) =>
  //     line
  //       ? ['--reuse-window', repoPath, '--goto', `${resolvedPath}:${line}`]
  //       : ['--reuse-window', repoPath, resolvedPath],
  // },

  // TODO: add WebStorm support
  // webstorm: {
  //   label: 'WebStorm',
  //   defaultCommand: 'webstorm',
  //   buildRepositoryArgs: ({ repoPath }) => [repoPath],
  //   buildFileInRepositoryArgs: ({ resolvedPath, repoPath, line }) =>
  //     line ? [repoPath, '--line', String(line), resolvedPath] : [repoPath, resolvedPath],
  // },

  // TODO: add Vim support
  // vim: {
  //   label: 'Vim',
  //   defaultCommand: 'vim',
  //   buildRepositoryArgs: ({ repoPath }) => [repoPath],
  //   buildFileInRepositoryArgs: ({ resolvedPath, repoPath, line }) =>
  //     line ? [`+${line}`, resolvedPath] : [resolvedPath],
  // },
}
