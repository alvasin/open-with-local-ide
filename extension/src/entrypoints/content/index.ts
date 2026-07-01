import { listenCurrentLocationMessages } from './messages/content-message.listener'
import { createOpenCurrentFileAction } from './open-actions/open-current-file'
import { createOpenCurrentRepositoryAction } from './open-actions/open-current-repository'
import { parseCurrentGitHubLocation, syncGitHubContent } from './site-integrations/github'

export default defineContentScript({
  matches: ['https://github.com/*'],
  main() {
    const openFile = createOpenCurrentFileAction(parseCurrentGitHubLocation)
    const openRepository = createOpenCurrentRepositoryAction(parseCurrentGitHubLocation)

    listenCurrentLocationMessages()
    syncGitHubContent({
      openFile,
      openRepository,
    })
  },
})
