import { syncGitHubContent } from './github'
import { listenCurrentLocationMessages } from './messages/content-message.listener'
import { openCurrentGitHubFile } from './open-in-ide/open-current-github-file'
import './style.css'

export default defineContentScript({
  matches: ['https://github.com/*'],
  main() {
    listenCurrentLocationMessages()
    syncGitHubContent(openCurrentGitHubFile)
  },
})
