import { parseSettings } from './settings.parser'
import type { ExtensionSettings } from './settings.types'
import { storageGet, storageSet } from '@/storage/storage'

const SETTINGS_STORAGE_KEY = 'settings'

export const getSettings = async (): Promise<ExtensionSettings> =>
  parseSettings(await storageGet(SETTINGS_STORAGE_KEY))

export const saveSettings = async (settings: ExtensionSettings): Promise<void> =>
  storageSet(SETTINGS_STORAGE_KEY, settings)
