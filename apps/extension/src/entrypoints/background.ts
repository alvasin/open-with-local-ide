import { openInIde, type OpenInIdeResponse } from '@/features/open-in-ide'
import { readExtensionMessage } from '@/shared/extension/extension-messages'
import { openOptionsPage } from '@/shared/extension/options-page'

// TODO: Вынести работу с service воркерами chrome в один централизованный файл-обертку.

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (rawMessage): Promise<OpenInIdeResponse | undefined> => {
    const message = readExtensionMessage(rawMessage)

    switch (message?.type) {
      case 'openInIde':
        return openInIde(message.request)
      case 'openOptions':
        await openOptionsPage(message.repoKey)
        return
    }
  })
})
