import { parseCurrentGitHubLocation } from '../github'
import { ExtensionMessageType } from '@/shared/extension/extension.enum'
import { isRecord } from '@/shared/record/record.guard'

export const listenCurrentLocationMessages = () => {
  browser.runtime.onMessage.addListener((message) => {
    if (!isRecord(message) || message.type !== ExtensionMessageType.GetCurrentLocation) return

    return Promise.resolve({ location: parseCurrentGitHubLocation() })
  })
}
