import { removeInjectedGitHubButtons, syncInjectedGitHubButton } from './github-button'
import { parseCurrentGitHubLocation } from './github-current-location'
import { listenGitHubPageChanges } from './github-navigation'

type OpenGitHubFileHandler = (button: HTMLButtonElement) => Promise<void>

export { parseCurrentGitHubLocation }

const syncCurrentGitHubPage = async (openGitHubFile: OpenGitHubFileHandler) => {
  const currentLocation = parseCurrentGitHubLocation()

  if (!currentLocation?.filePath) {
    removeInjectedGitHubButtons()
    return
  }

  await syncInjectedGitHubButton(openGitHubFile)
}

export const syncGitHubContent = (openGitHubFile: OpenGitHubFileHandler) => {
  return listenGitHubPageChanges(() => {
    void syncCurrentGitHubPage(openGitHubFile)
  })
}
