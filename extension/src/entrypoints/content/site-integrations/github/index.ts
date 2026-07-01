import { isCurrentGitHubRepositoryRootPage, parseCurrentGitHubLocation } from './current-location'
import {
  removeInjectedGitHubCodeDropdownItems,
  syncInjectedGitHubCodeDropdownItem,
} from './injected-controls/code-dropdown'
import {
  removeInjectedGitHubButtons,
  syncInjectedGitHubButton,
} from './injected-controls/file-button'
import { listenGitHubPageChanges } from './navigation'
import './injected-controls/style.css'

type GitHubContentHandlers = {
  openFile: (button: HTMLButtonElement) => Promise<void>
  openRepository: (button: HTMLButtonElement) => Promise<void>
}

export { parseCurrentGitHubLocation }

const removeInjectedGitHubControls = () => {
  removeInjectedGitHubButtons()
  removeInjectedGitHubCodeDropdownItems()
}

const syncCurrentGitHubPage = async ({ openFile, openRepository }: GitHubContentHandlers) => {
  const currentLocation = parseCurrentGitHubLocation()

  if (currentLocation?.filePath) {
    removeInjectedGitHubCodeDropdownItems()
    await syncInjectedGitHubButton(openFile)
    return
  }

  if (currentLocation && isCurrentGitHubRepositoryRootPage()) {
    removeInjectedGitHubButtons()
    await syncInjectedGitHubCodeDropdownItem(openRepository)
    return
  }

  removeInjectedGitHubControls()
}

export const syncGitHubContent = (handlers: GitHubContentHandlers) => {
  return listenGitHubPageChanges(() => {
    void syncCurrentGitHubPage(handlers)
  })
}
