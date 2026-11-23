import { parseCurrentGitHubLocation } from './current-location'
import {
  removeInjectedGitHubCodeDropdownItems,
  syncInjectedGitHubCodeDropdownItem,
} from './injected-controls/code-dropdown'
import {
  removeInjectedGitHubDirectoryDropdowns,
  syncInjectedGitHubDirectoryDropdown,
} from './injected-controls/directory-dropdown'
import { removeInjectedGitHubButtons, syncInjectedGitHubButton } from './injected-controls/file-button'
import { listenGitHubPageChanges } from './navigation'
import './injected-controls/style.css'

type GitHubOpenActions = {
  openCurrentLocation: () => Promise<void>
  openCurrentRepository: () => Promise<void>
}

export { parseCurrentGitHubLocation }

const removeInjectedGitHubControls = () => {
  removeInjectedGitHubButtons()
  removeInjectedGitHubCodeDropdownItems()
  removeInjectedGitHubDirectoryDropdowns()
}

const syncCurrentGitHubPage = async ({ openCurrentLocation, openCurrentRepository }: GitHubOpenActions) => {
  switch (parseCurrentGitHubLocation()?.kind) {
    case 'file':
      removeInjectedGitHubCodeDropdownItems()
      removeInjectedGitHubDirectoryDropdowns()
      await syncInjectedGitHubButton(openCurrentLocation)
      return
    case 'directory':
      removeInjectedGitHubButtons()
      removeInjectedGitHubCodeDropdownItems()
      await syncInjectedGitHubDirectoryDropdown({
        openDirectory: openCurrentLocation,
        openRepository: openCurrentRepository,
      })
      return
    case 'repository':
      removeInjectedGitHubButtons()
      removeInjectedGitHubDirectoryDropdowns()
      await syncInjectedGitHubCodeDropdownItem(openCurrentRepository)
      return
    default:
      removeInjectedGitHubControls()
  }
}

export const syncGitHubContent = (handlers: GitHubOpenActions) => {
  return listenGitHubPageChanges(() => {
    void syncCurrentGitHubPage(handlers)
  })
}
