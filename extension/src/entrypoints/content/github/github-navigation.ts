type GitHubPageChangeHandler = () => void
type GitHubPageChangeCleanup = () => void

export const listenGitHubPageChanges = (
  onPageChange: GitHubPageChangeHandler,
): GitHubPageChangeCleanup => {
  let syncTimeoutId: number | null = null

  const scheduleSync = () => {
    if (syncTimeoutId !== null) return

    syncTimeoutId = window.setTimeout(() => {
      syncTimeoutId = null
      onPageChange()
    }, 50)
  }

  const observer = new MutationObserver(scheduleSync)

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  window.addEventListener('popstate', scheduleSync)
  window.addEventListener('focus', scheduleSync)

  scheduleSync()

  return () => {
    if (syncTimeoutId !== null) {
      window.clearTimeout(syncTimeoutId)
      syncTimeoutId = null
    }

    observer.disconnect()
    window.removeEventListener('popstate', scheduleSync)
    window.removeEventListener('focus', scheduleSync)
  }
}
