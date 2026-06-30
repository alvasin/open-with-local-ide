import {
  removeInjectedGitHubCodeDropdownItems,
  syncInjectedGitHubCodeDropdownItem,
} from './code-dropdown'
import { removeInjectedGitHubButtons, syncInjectedGitHubButton } from './file-button'
import {
  isCurrentGitHubRepositoryRootPage,
  parseCurrentGitHubLocation,
} from './github-current-location'
import { listenGitHubPageChanges } from './github-navigation'
import './style.css'

type OpenGitHubFileHandler = (button: HTMLButtonElement) => Promise<void>
type OpenGitHubRepositoryHandler = (button: HTMLButtonElement) => Promise<void>

type SyncGitHubContentHandlers = {
  openGitHubFile: OpenGitHubFileHandler
  openGitHubRepository: OpenGitHubRepositoryHandler
}

export { parseCurrentGitHubLocation }

const removeInjectedGitHubControls = () => {
  removeInjectedGitHubButtons()
  removeInjectedGitHubCodeDropdownItems()
}

const syncCurrentGitHubPage = async ({
  openGitHubFile,
  openGitHubRepository,
}: SyncGitHubContentHandlers) => {
  const currentLocation = parseCurrentGitHubLocation()

  if (currentLocation?.filePath) {
    removeInjectedGitHubCodeDropdownItems()
    await syncInjectedGitHubButton(openGitHubFile)
    return
  }

  if (currentLocation && isCurrentGitHubRepositoryRootPage()) {
    removeInjectedGitHubButtons()
    await syncInjectedGitHubCodeDropdownItem(openGitHubRepository)
    return
  }

  removeInjectedGitHubControls()
}

export const syncGitHubContent = (handlers: SyncGitHubContentHandlers) => {
  return listenGitHubPageChanges(() => {
    void syncCurrentGitHubPage(handlers)
  })
}
