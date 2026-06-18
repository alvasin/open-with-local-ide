import { parseIdeSettings } from './ide/ide.parser'
import { parseRepoMappings } from './mappings/mappings.parser'
import { defaultSettings } from './settings.defaults'
import type { ExtensionSettings } from './settings.types'
import { isRecord } from '@/shared/record/record.guard'

export const parseSettings = (value: unknown): ExtensionSettings => {
  if (!isRecord(value)) return defaultSettings()

  return {
    mappings: parseRepoMappings(value.mappings),
    ide: parseIdeSettings(value.ide),
  }
}
