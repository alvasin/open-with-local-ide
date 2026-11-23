import { listenCurrentLocationMessages } from './messages/content-message.listener'
import { openLocation } from './open-actions/open-location'
import { parseCurrentGitHubLocation, syncGitHubContent } from './site-integrations/github'

export default defineContentScript({
  matches: ['https://github.com/*'],
  main() {
    listenCurrentLocationMessages()
    syncGitHubContent({
      openCurrentLocation: () => openLocation(parseCurrentGitHubLocation()),
      openCurrentRepository: () => {
        const location = parseCurrentGitHubLocation()
        return openLocation(location && { ...location, kind: 'repository' })
      },
    })
  },
})
