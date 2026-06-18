import { removeInjectedGitHubButtons, syncInjectedGitHubButton } from './github-button'
import { parseCurrentGitHubFile } from './github-current-file'
import { listenGitHubPageChanges } from './github-navigation'

const syncCurrentGitHubPage = async () => {
  const currentFile = parseCurrentGitHubFile()

  if (!currentFile) {
    removeInjectedGitHubButtons()
    return
  }

  await syncInjectedGitHubButton()
}

export const syncGitHubContent = () => {
  listenGitHubPageChanges(() => {
    void syncCurrentGitHubPage()
  })
}
