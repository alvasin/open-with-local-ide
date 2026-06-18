import { syncGitHubContent } from './github/github-content'
import { listenCurrentFileMessages } from './messages/content-message.listener'

export default defineContentScript({
  matches: ['https://github.com/*'],
  main() {
    listenCurrentFileMessages()
    syncGitHubContent()
  },
})
