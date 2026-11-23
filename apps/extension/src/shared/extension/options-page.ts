/** Opens the options page, prefilling the repository mapping form when `repoKey` is given. */
export const openOptionsPage = async (repoKey?: string): Promise<void> => {
  if (!repoKey) {
    await browser.runtime.openOptionsPage()
    return
  }

  await browser.tabs.create({
    url: browser.runtime.getURL(`/options.html?repoKey=${encodeURIComponent(repoKey)}`),
  })
}
