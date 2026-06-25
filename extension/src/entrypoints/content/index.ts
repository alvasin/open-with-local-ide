import { syncGitHubContent } from './github/github-content'
import { listenCurrentLocationMessages } from './messages/content-message.listener'

export default defineContentScript({
  matches: ['https://github.com/*'],
  main() {
    listenCurrentLocationMessages()
    syncGitHubContent()
  },
})
