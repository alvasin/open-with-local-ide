import { listenCurrentLocationMessages } from './messages/content-message.listener'
import { createOpenCurrentDirectoryAction } from './open-actions/open-current-directory'
import { createOpenCurrentFileAction } from './open-actions/open-current-file'
import { createOpenCurrentRepositoryAction } from './open-actions/open-current-repository'
import { parseCurrentGitHubLocation, syncGitHubContent } from './site-integrations/github'

export default defineContentScript({
  matches: ['https://github.com/*'],
  main() {
    const openFile = createOpenCurrentFileAction(parseCurrentGitHubLocation)
    const openDirectory = createOpenCurrentDirectoryAction(parseCurrentGitHubLocation)
    const openRepository = createOpenCurrentRepositoryAction(parseCurrentGitHubLocation)

    listenCurrentLocationMessages()
    syncGitHubContent({
      openDirectory,
      openFile,
      openRepository,
    })
  },
})
