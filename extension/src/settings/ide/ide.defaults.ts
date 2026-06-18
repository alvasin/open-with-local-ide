import type { IdeSettings } from './ide.types'

export const defaultIdeSettings = (): IdeSettings => ({
  selectedIde: 'vscode',
  ideCommands: {
    vscode: 'code',
  },
})
