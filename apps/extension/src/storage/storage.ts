export const storageGet = async <T>(key: string): Promise<T | undefined> => {
  const result = await browser.storage.local.get(key)
  return result[key] as T | undefined
}

export const storageSet = async <T>(key: string, value: T): Promise<void> => {
  await browser.storage.local.set({ [key]: value })
}

/** Calls `listener` with the new raw value whenever `key` changes in local storage. */
export const storageSubscribe = (key: string, listener: (value: unknown) => void): (() => void) => {
  const handleChange = (changes: Record<string, { newValue?: unknown }>, areaName: string) => {
    if (areaName === 'local' && key in changes) listener(changes[key]?.newValue)
  }

  browser.storage.onChanged.addListener(handleChange)

  return () => browser.storage.onChanged.removeListener(handleChange)
}
