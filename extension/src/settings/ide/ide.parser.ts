import { defaultIdeSettings } from './ide.defaults'
import type { IdeSettings } from './ide.types'
import type { IdeId } from '@/shared/ide/ide.types'
import { isRecord } from '@/shared/record/record.guard'

const parseSelectedIde = (value: unknown): IdeId => {
  if (value === 'vscode') return value
  return 'vscode'
}

const parseIdeCommands = (value: unknown): Record<IdeId, string> => {
  const defaults = defaultIdeSettings().ideCommands
  if (!isRecord(value)) return defaults

  const vscodeCommand = value.vscode
  if (typeof vscodeCommand !== 'string') return defaults

  return { vscode: vscodeCommand }
}

export const parseIdeSettings = (value: unknown): IdeSettings => {
  if (!isRecord(value)) return defaultIdeSettings()

  return {
    selectedIde: parseSelectedIde(value.selectedIde),
    ideCommands: parseIdeCommands(value.ideCommands),
  }
}
