import { parseCurrentGitHubFile } from '../github/github-current-file'
import {
  createNativeOpenFileRequest,
  getMissingRepoMappingMessage,
  getNativeHostUiMessage,
} from '@/features/open-file/openFile'
import type { NativeOpenFileResponse } from '@/features/open-file/types'
import { getSettings } from '@/settings/settings.storage'
import { ExtensionMessageType } from '@/shared/extension/extension.enum'
import { isRecord } from '@/shared/record/record.guard'

const logWarnName = '[open-with-local-ide]'

const isNativeOpenFileResponse = (value: unknown): value is NativeOpenFileResponse =>
  isRecord(value) && typeof value.ok === 'boolean'

export const openCurrentGitHubFile = async (button: HTMLButtonElement) => {
  const currentFile = parseCurrentGitHubFile()
  if (!currentFile) return

  const settings = await getSettings()
  const result = createNativeOpenFileRequest(currentFile, settings)

  if (!result.ok) {
    console.warn(logWarnName, getMissingRepoMappingMessage(result.repoKey))
    return
  }

  button.disabled = true

  try {
    const response = await browser.runtime.sendMessage({
      type: ExtensionMessageType.OpenRemoteFile,
      request: result.request,
    })

    if (!isNativeOpenFileResponse(response)) return
    if (response.ok) return

    console.warn(logWarnName, getNativeHostUiMessage(response))
  } finally {
    button.disabled = false
  }
}
