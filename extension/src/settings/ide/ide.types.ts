import type { IdeId } from '@/shared/ide/ide.types'

export interface IdeSettings {
  selectedIde: IdeId
  ideCommands: Record<IdeId, string>
}
