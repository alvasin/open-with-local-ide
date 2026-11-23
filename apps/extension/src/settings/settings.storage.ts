import { parseSettings, type ExtensionSettings } from './settings.schema'
import { storageGet, storageSet, storageSubscribe } from '@/storage/storage'

const SETTINGS_STORAGE_KEY = 'settings'

export const getSettings = async (): Promise<ExtensionSettings> => parseSettings(await storageGet(SETTINGS_STORAGE_KEY))

export const saveSettings = async (settings: ExtensionSettings): Promise<void> =>
  storageSet(SETTINGS_STORAGE_KEY, settings)

/** Notifies about every settings change, including changes made by other extension pages. */
export const subscribeSettings = (listener: (settings: ExtensionSettings) => void): (() => void) =>
  storageSubscribe(SETTINGS_STORAGE_KEY, (value) => listener(parseSettings(value)))

/**
 * Reads the settings, lets `change` edit them in place, and saves the result. `getSettings`
 * returns a fresh object, so editing it directly is safe. Returns whatever `change` returns.
 */
export const updateSettings = async <T>(change: (settings: ExtensionSettings) => T): Promise<T> => {
  const settings = await getSettings()
  const result = change(settings)
  await saveSettings(settings)
  return result
}
