<template>
  <main class="popup">
    <PopupHeader @open-options="openOptions" />

    <CurrentLocationSection
      :current-location="currentLocation"
      :is-loading="isLoading"
      :is-opening="isOpening"
      :selected-ide-label="selectedIdeLabel"
      :status="status"
      @open-current-location="openCurrentLocation"
    />

    <PopupStatusSection
      :current-location="currentLocation"
      :should-show-open-options="shouldShowOpenOptions"
      :status="status"
      @open-options="openOptionsForCurrentRepo"
    />
  </main>
</template>

<script lang="ts" setup>
import { NativeHostErrorCode } from '@native-protocol'
import { computed, onMounted, ref } from 'vue'
import CurrentLocationSection from './components/CurrentLocationSection.vue'
import PopupHeader from './components/PopupHeader.vue'
import PopupStatusSection from './components/PopupStatusSection.vue'
import {
  createOpenFileRequest,
  createOpenRepositoryRequest,
  getIdeLabel,
  getMissingRepoMappingMessage,
  getNativeHostUiMessage,
} from '@/features/open-in-ide/open-in-ide'
import type {
  OpenInIdeErrorCode,
  OpenInIdeResponse,
} from '@/features/open-in-ide/open-in-ide.types'
import type { ParsedRemoteLocation } from '@/providers/types'
import { isSameRepository } from '@/settings/mappings/mappings'
import { getSettings } from '@/settings/settings.storage'
import type { ExtensionSettings } from '@/settings/settings.types'
import { ExtensionMessageType } from '@/shared/extension/extension.enum'
import { isRecord } from '@/shared/record/record.guard'

const currentLocation = ref<ParsedRemoteLocation | null>(null)
const settings = ref<ExtensionSettings | null>(null)

const isLoading = ref(true)
const isOpening = ref(false)

const status = ref('')
const shouldShowOpenOptions = ref(false)

const selectedIdeLabel = computed(() =>
  settings.value ? getIdeLabel(settings.value.ide.selectedIde) : 'VS Code',
)

const isCurrentLocationResponse = (
  value: unknown,
): value is { location: ParsedRemoteLocation | null } =>
  isRecord(value) && (value.location === null || isRecord(value.location))

const isOpenInIdeResponse = (value: unknown): value is OpenInIdeResponse =>
  isRecord(value) && typeof value.ok === 'boolean'

const loadPopupState = async () => {
  isLoading.value = true
  currentLocation.value = null
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
            .sendMessage(tab.id, { type: ExtensionMessageType.GetCurrentLocation })
            .catch(() => null)
        : null,
    ])

    settings.value = loadedSettings

    if (!isCurrentLocationResponse(fileResponse) || !fileResponse.location) {
      status.value = 'Current tab is not a supported GitHub file page.'
      return
    }

    const file = fileResponse.location
    currentLocation.value = file

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
  const repoKey = currentLocation.value?.repoKey

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

const openCurrentLocation = async () => {
  const file = currentLocation.value
  const currentSettings = settings.value

  if (!file || !currentSettings) return

  const result = file.filePath
    ? createOpenFileRequest({ ...file, filePath: file.filePath }, currentSettings)
    : createOpenRepositoryRequest(file, currentSettings)

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
      type: ExtensionMessageType.OpenInIde,
      request: result.request,
    })

    if (!isOpenInIdeResponse(response)) {
      status.value = 'Native host returned an invalid response.'
      return
    }

    if (response.ok) {
      status.value = file.filePath ? 'File opened successfully.' : 'Repository opened successfully.'
      return
    }

    status.value = getNativeHostUiMessage(response)
    const repoPathErrorCodes: OpenInIdeErrorCode[] = [
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
