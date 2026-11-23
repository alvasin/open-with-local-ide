import { parseCurrentGitHubLocation } from '../site-integrations/github'
import { readExtensionMessage } from '@/shared/extension/extension-messages'

export const listenCurrentLocationMessages = () => {
  browser.runtime.onMessage.addListener((message) => {
    if (readExtensionMessage(message)?.type !== 'getCurrentLocation') return

    return Promise.resolve({ location: parseCurrentGitHubLocation() })
  })
}
