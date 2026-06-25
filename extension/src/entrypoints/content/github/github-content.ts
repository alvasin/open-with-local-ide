import { removeInjectedGitHubButtons, syncInjectedGitHubButton } from './github-button'
import { parseCurrentGitHubLocation } from './github-current-location'
import { listenGitHubPageChanges } from './github-navigation'

const syncCurrentGitHubPage = async () => {
  const currentLocation = parseCurrentGitHubLocation()

  if (!currentLocation) {
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
