type GitHubPageChangeHandler = () => void

export const listenGitHubPageChanges = (onPageChange: GitHubPageChangeHandler) => {
  let syncTimeoutId: number | null = null

  const scheduleSync = () => {
    if (syncTimeoutId !== null) return

    syncTimeoutId = window.setTimeout(() => {
      syncTimeoutId = null
      onPageChange()
    }, 100)
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
}
