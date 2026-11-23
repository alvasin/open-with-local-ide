<template>
  <main class="popup">
    <PopupHeader @open-options="openOptions()" />

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
import { computed, onMounted, ref } from 'vue'
import CurrentLocationSection from './components/CurrentLocationSection.vue'
import PopupHeader from './components/PopupHeader.vue'
import PopupStatusSection from './components/PopupStatusSection.vue'
import { findRepositoryMapping, openLocationInIde } from '@/features/open-in-ide'
import type { ParsedRemoteLocation } from '@/providers/types'
import type { ExtensionSettings } from '@/settings/settings.schema'
import { getSettings } from '@/settings/settings.storage'
import type { ExtensionMessage } from '@/shared/extension/extension-messages'
import { openOptionsPage } from '@/shared/extension/options-page'
import { getIdeLabel } from '@/shared/ide/ide'
import { isRecord } from '@/shared/record/record.guard'
import { getMissingRepoMappingError, type UiError } from '@/shared/ui-errors/ui-errors'

const OPENED_MESSAGES: Record<ParsedRemoteLocation['kind'], string> = {
  file: 'File opened successfully.',
  directory: 'Directory opened successfully.',
  repository: 'Repository opened successfully.',
}

const currentLocation = ref<ParsedRemoteLocation | null>(null)
const settings = ref<ExtensionSettings | null>(null)

const isLoading = ref(true)
const isOpening = ref(false)

const status = ref('')
const shouldShowOpenOptions = ref(false)

const showStatus = (message: string) => {
  status.value = message
  shouldShowOpenOptions.value = false
}

const showError = (error: UiError) => {
  status.value = error.message
  shouldShowOpenOptions.value = error.action === 'openOptions'
}

const selectedIdeLabel = computed(() => (settings.value ? getIdeLabel(settings.value.ide.selectedIde) : 'VS Code'))

const isCurrentLocationResponse = (value: unknown): value is { location: ParsedRemoteLocation | null } =>
  isRecord(value) && (value.location === null || (isRecord(value.location) && typeof value.location.kind === 'string'))

const readCurrentTabLocation = async (): Promise<ParsedRemoteLocation | null> => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  if (typeof tab?.id !== 'number') return null

  const response: unknown = await browser.tabs
    .sendMessage(tab.id, { type: 'getCurrentLocation' } satisfies ExtensionMessage)
    .catch(() => null)

  return isCurrentLocationResponse(response) ? response.location : null
}

const loadPopupState = async () => {
  isLoading.value = true
  currentLocation.value = null
  showStatus('')

  try {
    const [loadedSettings, location] = await Promise.all([getSettings(), readCurrentTabLocation()])

    settings.value = loadedSettings
    currentLocation.value = location

    if (!location) {
      showStatus('Current tab is not a supported GitHub page.')
      return
    }

    if (!findRepositoryMapping(location, loadedSettings)) {
      showError(getMissingRepoMappingError(location.repoKey))
    }
  } catch (error) {
    showStatus(error instanceof Error ? error.message : 'Failed to read the current tab.')
  } finally {
    isLoading.value = false
  }
}

const openOptions = async (repoKey?: string) => {
  try {
    await openOptionsPage(repoKey)
  } catch {
    showStatus('Options page is not available yet.')
  }
}

const openOptionsForCurrentRepo = () => openOptions(currentLocation.value?.repoKey)

const openCurrentLocation = async () => {
  const location = currentLocation.value
  if (!location) return

  showStatus('')
  isOpening.value = true

  try {
    const error = await openLocationInIde(location)

    if (error) showError(error)
    else showStatus(OPENED_MESSAGES[location.kind])
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
