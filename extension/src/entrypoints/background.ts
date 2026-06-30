import type { OpenInIdeRequest } from '@native-protocol'
import { openInIde, type OpenInIdeResponse } from '@/features/open-in-ide'
import { ExtensionMessageType } from '@/shared/extension/extension.enum'
import { isRecord } from '@/shared/record/record.guard'

type OpenInIdeMessage = {
  type: ExtensionMessageType.OpenInIde
  request: OpenInIdeRequest
}

const isOpenInIdeMessage = (message: unknown): message is OpenInIdeMessage =>
  isRecord(message) && message.type === ExtensionMessageType.OpenInIde && isRecord(message.request)

// TODO: Вынести работу с service воркерами chrome в один централизованный файл-обертку.

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (message): Promise<OpenInIdeResponse | undefined> => {
    if (!isOpenInIdeMessage(message)) return

    return openInIde(message.request)
  })
})
