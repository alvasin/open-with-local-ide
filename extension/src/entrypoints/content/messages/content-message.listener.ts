import { parseCurrentGitHubFile } from '../github/github-current-file'
import { ExtensionMessageType } from '@/shared/extension/extension.enum'
import { isRecord } from '@/shared/record/record.guard'

export const listenCurrentFileMessages = () => {
  browser.runtime.onMessage.addListener((message) => {
    if (!isRecord(message) || message.type !== ExtensionMessageType.GetCurrentFile) return

    return Promise.resolve({ file: parseCurrentGitHubFile() })
  })
}
