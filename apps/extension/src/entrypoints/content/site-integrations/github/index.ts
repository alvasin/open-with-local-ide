import { isCurrentGitHubRepositoryRootPage, parseCurrentGitHubLocation } from './current-location'
import {
  removeInjectedGitHubCodeDropdownItems,
  syncInjectedGitHubCodeDropdownItem,
} from './injected-controls/code-dropdown'
import {
  removeInjectedGitHubDirectoryDropdowns,
  syncInjectedGitHubDirectoryDropdown,
} from './injected-controls/directory-dropdown'
import {
  removeInjectedGitHubButtons,
  syncInjectedGitHubButton,
} from './injected-controls/file-button'
import { listenGitHubPageChanges } from './navigation'
import './injected-controls/style.css'

type GitHubOpenActions = {
  openDirectory: (button: HTMLButtonElement) => Promise<void>
  openFile: (button: HTMLButtonElement) => Promise<void>
  openRepository: (button: HTMLButtonElement) => Promise<void>
}

export { parseCurrentGitHubLocation }

const removeInjectedGitHubControls = () => {
  removeInjectedGitHubButtons()
  removeInjectedGitHubCodeDropdownItems()
  removeInjectedGitHubDirectoryDropdowns()
}

const syncCurrentGitHubPage = async ({
  openDirectory,
  openFile,
  openRepository,
}: GitHubOpenActions) => {
  const currentLocation = parseCurrentGitHubLocation()

  if (currentLocation?.filePath) {
    removeInjectedGitHubCodeDropdownItems()
    removeInjectedGitHubDirectoryDropdowns()
    await syncInjectedGitHubButton(openFile)
    return
  }

  if (currentLocation?.directoryPath) {
    removeInjectedGitHubButtons()
    removeInjectedGitHubCodeDropdownItems()
    await syncInjectedGitHubDirectoryDropdown({ openDirectory, openRepository })
    return
  }

  if (currentLocation && isCurrentGitHubRepositoryRootPage()) {
    removeInjectedGitHubButtons()
    removeInjectedGitHubDirectoryDropdowns()
    await syncInjectedGitHubCodeDropdownItem(openRepository)
    return
  }

  removeInjectedGitHubControls()
}

export const syncGitHubContent = (handlers: GitHubOpenActions) => {
  return listenGitHubPageChanges(() => {
    void syncCurrentGitHubPage(handlers)
  })
}
