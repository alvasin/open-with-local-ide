<template>
  <main class="popup">
    <PopupHeader @open-options="openOptions" />

    <CurrentFileSection
      :current-file="currentFile"
      :is-loading="isLoading"
      :is-opening="isOpening"
      :selected-ide-label="selectedIdeLabel"
      :status="status"
      @open-current-file="openCurrentFile"
    />

    <PopupStatusSection
      :current-file="currentFile"
      :should-show-open-options="shouldShowOpenOptions"
      :status="status"
      @open-options="openOptionsForCurrentRepo"
    />
  </main>
</template>

<script lang="ts" setup>
import { NativeHostErrorCode } from '@native-protocol'
import { computed, onMounted, ref } from 'vue'
import CurrentFileSection from './components/CurrentFileSection.vue'
import PopupHeader from './components/PopupHeader.vue'
import PopupStatusSection from './components/PopupStatusSection.vue'
import {
  createNativeOpenFileRequest,
  getIdeLabel,
  getMissingRepoMappingMessage,
  getNativeHostUiMessage,
} from '@/features/open-file/openFile'
import type { NativeOpenFileErrorCode, NativeOpenFileResponse } from '@/features/open-file/types'
import type { ParsedRemoteFile } from '@/providers/types'
import { isSameRepository } from '@/settings/mappings/mappings'
import { getSettings } from '@/settings/settings.storage'
import type { ExtensionSettings } from '@/settings/settings.types'
import { ExtensionMessageType } from '@/shared/extension/extension.enum'
import { isRecord } from '@/shared/record/record.guard'

const currentFile = ref<ParsedRemoteFile | null>(null)
const settings = ref<ExtensionSettings | null>(null)

const isLoading = ref(true)
const isOpening = ref(false)

const status = ref('')
const shouldShowOpenOptions = ref(false)

const selectedIdeLabel = computed(() =>
  settings.value ? getIdeLabel(settings.value.ide.selectedIde) : 'VS Code',
)

const isCurrentFileResponse = (value: unknown): value is { file: ParsedRemoteFile | null } =>
  isRecord(value) && (value.file === null || isRecord(value.file))

const isNativeOpenFileResponse = (value: unknown): value is NativeOpenFileResponse =>
  isRecord(value) && typeof value.ok === 'boolean'

const loadPopupState = async () => {
  isLoading.value = true
  currentFile.value = null
  status.value = ''
  shouldShowOpenOptions.value = false

  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    })

    const [loadedSettings, fileResponse] = await Promise.all([
      getSettings(),
      typeof tab?.id === 'number'
        ? browser.tabs
            .sendMessage(tab.id, { type: ExtensionMessageType.GetCurrentFile })
            .catch(() => null)
        : null,
    ])

    settings.value = loadedSettings

    if (!isCurrentFileResponse(fileResponse) || !fileResponse.file) {
      status.value = 'Current tab is not a supported GitHub file page.'
      return
    }

    const file = fileResponse.file
    currentFile.value = file

    if (
      !loadedSettings.mappings.some((mapping) =>
        isSameRepository(mapping, {
          provider: file.provider,
          owner: file.owner,
          repo: file.repo,
        }),
      )
    ) {
      status.value = getMissingRepoMappingMessage(file.repoKey)
      shouldShowOpenOptions.value = true
    }
  } catch (error) {
    status.value =
      error instanceof Error ? error.message : 'Current tab is not a supported GitHub file page.'
  } finally {
    isLoading.value = false
  }
}

const openOptions = async () => {
  try {
    await browser.runtime.openOptionsPage()
  } catch {
    status.value = 'Options page is not available yet.'
  }
}

const openOptionsForCurrentRepo = async () => {
  const repoKey = currentFile.value?.repoKey

  if (!repoKey) {
    await openOptions()
    return
  }

  try {
    await browser.tabs.create({
      url: browser.runtime.getURL(`/options.html?repoKey=${encodeURIComponent(repoKey)}`),
    })
  } catch {
    status.value = 'Options page is not available yet.'
  }
}

const openCurrentFile = async () => {
  const file = currentFile.value
  const currentSettings = settings.value

  if (!file || !currentSettings) return

  const result = createNativeOpenFileRequest(file, currentSettings)

  if (!result.ok) {
    status.value = getMissingRepoMappingMessage(result.repoKey)
    shouldShowOpenOptions.value = true
    return
  }

  status.value = ''
  shouldShowOpenOptions.value = false
  isOpening.value = true

  try {
    const response = await browser.runtime.sendMessage({
      type: ExtensionMessageType.OpenRemoteFile,
      request: result.request,
    })

    if (!isNativeOpenFileResponse(response)) {
      status.value = 'Native host returned an invalid response.'
      return
    }

    if (response.ok) {
      status.value = file.filePath ? 'File opened successfully.' : 'Repository opened successfully.'
      return
    }

    status.value = getNativeHostUiMessage(response)
    const repoPathErrorCodes: NativeOpenFileErrorCode[] = [
      NativeHostErrorCode.RepoPathMustBeAbsolute,
      NativeHostErrorCode.RepoPathNotFound,
      NativeHostErrorCode.RepoPathNotDirectory,
    ]

    shouldShowOpenOptions.value = repoPathErrorCodes.includes(response.errorCode)
  } catch (error) {
    status.value = error instanceof Error ? error.message : 'Failed to open repository.'
  } finally {
    isOpening.value = false
  }
}

onMounted(loadPopupState)
</script>

<style lang="scss" scoped>
.popup {
  display: grid;
  gap: 12px;
}
</style>
