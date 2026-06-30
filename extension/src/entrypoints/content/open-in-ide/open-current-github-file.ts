import { parseCurrentGitHubLocation } from '../github'
import {
  createOpenFileRequest,
  getMissingRepoMappingMessage,
  getNativeHostUiMessage,
  type OpenInIdeResponse,
} from '@/features/open-in-ide'
import { getSettings } from '@/settings/settings.storage'
import { ExtensionMessageType } from '@/shared/extension/extension.enum'
import { isRecord } from '@/shared/record/record.guard'

const logWarnName = '[open-with-local-ide]'

const isOpenInIdeResponse = (value: unknown): value is OpenInIdeResponse =>
  isRecord(value) && typeof value.ok === 'boolean'

export const openCurrentGitHubFile = async (button: HTMLButtonElement) => {
  const currentFile = parseCurrentGitHubLocation()
  if (!currentFile?.filePath) return

  const settings = await getSettings()
  const result = createOpenFileRequest({ ...currentFile, filePath: currentFile.filePath }, settings)

  if (!result.ok) {
    console.warn(logWarnName, getMissingRepoMappingMessage(result.repoKey))
    return
  }

  button.disabled = true

  try {
    const response = await browser.runtime.sendMessage({
      type: ExtensionMessageType.OpenInIde,
      request: result.request,
    })

    if (!isOpenInIdeResponse(response)) return
    if (response.ok) return

    console.warn(logWarnName, getNativeHostUiMessage(response))
  } finally {
    button.disabled = false
  }
}
