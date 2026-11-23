import type { IdeId } from './ide.types'

const IDE_LABELS: Record<IdeId, string> = {
  vscode: 'VS Code',
}

export const getIdeLabel = (ide: IdeId): string => IDE_LABELS[ide]
