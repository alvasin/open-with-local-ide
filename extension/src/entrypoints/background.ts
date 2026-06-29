import type { NativeOpenFileRequest, NativeOpenFileResponse } from '@/features/open-file/types'
import { openFileInIde } from '@/native-messaging/open-file.native'
import { ExtensionMessageType } from '@/shared/extension/extension.enum'
import { isRecord } from '@/shared/record/record.guard'

type OpenRemoteFileMessage = {
  type: ExtensionMessageType.OpenRemoteFile
  request: NativeOpenFileRequest
}

const isOpenRemoteFileMessage = (message: unknown): message is OpenRemoteFileMessage =>
  isRecord(message) &&
  message.type === ExtensionMessageType.OpenRemoteFile &&
  isRecord(message.request)

// TODO: Вынести работу с service воркерами chrome в один централизованный файл-обертку.

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    async (message): Promise<NativeOpenFileResponse | undefined> => {
      if (!isOpenRemoteFileMessage(message)) return

      return openFileInIde(message.request)
    },
  )
})
