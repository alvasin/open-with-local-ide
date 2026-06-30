import { removeInjectedGitHubButtons, syncInjectedGitHubButton } from './github-button'
import { parseCurrentGitHubLocation } from './github-current-location'
import { listenGitHubPageChanges } from './github-navigation'

type OpenGitHubFileHandler = (button: HTMLButtonElement) => Promise<void>

export { parseCurrentGitHubLocation }

const syncCurrentGitHubPage = async (openGitHubFile: OpenGitHubFileHandler) => {
  const currentLocation = parseCurrentGitHubLocation()

  if (!currentLocation) {
    removeInjectedGitHubButtons()
    return
  }

  await syncInjectedGitHubButton(openGitHubFile)
}

export const syncGitHubContent = (openGitHubFile: OpenGitHubFileHandler) => {
  listenGitHubPageChanges(() => {
    void syncCurrentGitHubPage(openGitHubFile)
  })
}
