<template>
  <section class="scan-folders">
    <div class="scan-folders__header">
      <h2 class="scan-folders__title">Repository scan folders</h2>
      <p class="scan-folders__text">Manually discover local repositories from GitHub remotes.</p>
    </div>

    <div class="scan-folders__add">
      <input
        v-model="folderPath"
        class="scan-folders__input"
        type="text"
        placeholder="C:\Users\me\Projects"
        @keyup.enter="addFolder"
      />
      <button class="scan-folders__primary-button" type="button" @click="addFolder">
        Add folder
      </button>
    </div>

    <p v-if="status" class="scan-folders__status">{{ status }}</p>
    <p v-if="isLoading" class="scan-folders__empty">Loading folders...</p>
    <p v-else-if="folders.length === 0" class="scan-folders__empty">No scan folders configured.</p>

    <article v-for="folder in folders" v-else :key="folder.id" class="scan-folders__card">
      <button class="scan-folders__toggle" type="button" @click="toggleFolder(folder.id)">
        <span>{{ isExpanded(folder.id) ? '▾' : '▸' }}</span>
        <strong>{{ folder.path }}</strong>
      </button>

      <div v-if="isExpanded(folder.id)" class="scan-folders__details">
        <p class="scan-folders__meta">
          Last scan: {{ folder.lastScannedAt ? formatDate(folder.lastScannedAt) : 'never' }}
        </p>

        <div class="scan-folders__actions">
          <button
            class="scan-folders__primary-button"
            type="button"
            :disabled="folderState(folder.id).scanning"
            @click="scanFolder(folder.id)"
          >
            {{ folderState(folder.id).scanning ? 'Scanning...' : 'Scan' }}
          </button>
          <button class="scan-folders__button" type="button" @click="removeFolder(folder.id)">
            Delete folder
          </button>
          <button
            v-if="folderMappings(folder.id).length"
            class="scan-folders__button"
            type="button"
            @click="removeFolderMappings(folder.id)"
          >
            Delete mappings
          </button>
        </div>

        <p v-if="folderState(folder.id).message" class="scan-folders__status">
          {{ folderState(folder.id).message }}
        </p>

        <div v-if="folderMappings(folder.id).length" class="scan-folders__nested">
          <p class="scan-folders__subtitle">Active mappings</p>
          <div
            v-for="mapping in folderMappings(folder.id)"
            :key="mapping.id"
            class="scan-folders__mapping"
          >
            <strong>✓ {{ getRepositoryKey(mapping) }}</strong>
            <span>{{ mapping.repoPath }}</span>
          </div>
        </div>

        <div v-if="folderState(folder.id).conflicts.length" class="scan-folders__nested">
          <p class="scan-folders__subtitle">Conflicts</p>
          <div
            v-for="conflict in folderState(folder.id).conflicts"
            :key="conflict.existing.id"
            class="scan-folders__conflict"
          >
            <strong>{{ getRepositoryKey(conflict.existing) }}</strong>
            <span>Existing: {{ conflict.existing.repoPath }}</span>
            <span>Discovered: {{ conflict.discovered.repoPath }}</span>
            <div class="scan-folders__actions">
              <button
                class="scan-folders__button"
                type="button"
                @click="keepExisting(folder.id, conflict)"
              >
                Keep existing
              </button>
              <button
                class="scan-folders__button"
                type="button"
                @click="replaceMapping(folder.id, conflict)"
              >
                Replace
              </button>
            </div>
          </div>
        </div>

        <div v-if="folderState(folder.id).skipped.length" class="scan-folders__nested">
          <p class="scan-folders__subtitle">
            Skipped entries ({{ folderState(folder.id).skipped.length }})
          </p>
          <p
            v-for="entry in folderState(folder.id).skipped.slice(0, 10)"
            :key="`${entry.path}:${entry.reason}`"
            class="scan-folders__skipped"
          >
            {{ skippedMessage(entry.reason) }}: {{ entry.path }}
          </p>
        </div>
      </div>
    </article>
  </section>
</template>

<script lang="ts" setup>
import {
  NativeHostErrorCode,
  type ScanSkippedEntry,
  type ScanSkippedReason,
} from '@native-protocol'
import { computed, onMounted, ref } from 'vue'
import {
  addRepositoryScanFolder,
  deleteRepositoryScanFolder,
  deleteScanFolderMappings,
  RepositoryScanningErrorCode,
  replaceMappingWithDiscovered,
  scanRepositoryFolder,
  type RepositoryScanConflict,
} from '@/features/repository-scanning'
import { ExtensionNativeErrorCode } from '@/native-messaging'
import { getRepositoryKey } from '@/settings/mappings/mappings'
import type { RepositoryMapping } from '@/settings/mappings/mappings.types'
import { getSettings } from '@/settings/settings.storage'
import type { ExtensionSettings } from '@/settings/settings.types'

type FolderUiState = {
  scanning: boolean
  message: string
  conflicts: RepositoryScanConflict[]
  skipped: ScanSkippedEntry[]
}

const settings = ref<ExtensionSettings | null>(null)
const folderPath = ref('')
const status = ref('')
const isLoading = ref(true)
const expandedFolderIds = ref(new Set<string>())
const folderStates = ref<Record<string, FolderUiState>>({})

const folders = computed(() => settings.value?.repositoryScanFolders ?? [])

const emptyFolderState = (): FolderUiState => ({
  scanning: false,
  message: '',
  conflicts: [],
  skipped: [],
})

const folderState = (folderId: string): FolderUiState =>
  folderStates.value[folderId] ?? emptyFolderState()

const updateFolderState = (folderId: string, patch: Partial<FolderUiState>) => {
  folderStates.value = {
    ...folderStates.value,
    [folderId]: { ...folderState(folderId), ...patch },
  }
}

const loadSettings = async () => {
  isLoading.value = true
  try {
    settings.value = await getSettings()
  } catch {
    status.value = 'Failed to load scan folders.'
  } finally {
    isLoading.value = false
  }
}

const addFolder = async () => {
  try {
    const result = await addRepositoryScanFolder(folderPath.value)
    if (!result.ok) {
      status.value = {
        required: 'Folder path is required.',
        not_absolute: 'Folder path must be absolute.',
        duplicate: 'This scan folder already exists.',
      }[result.reason]
      return
    }

    expandedFolderIds.value = new Set([...expandedFolderIds.value, result.folder.id])
    folderPath.value = ''
    status.value = 'Scan folder added.'
    await loadSettings()
  } catch {
    status.value = 'Failed to add scan folder.'
  }
}

const toggleFolder = (folderId: string) => {
  const next = new Set(expandedFolderIds.value)
  if (next.has(folderId)) next.delete(folderId)
  else next.add(folderId)
  expandedFolderIds.value = next
}

const isExpanded = (folderId: string): boolean => expandedFolderIds.value.has(folderId)

const folderMappings = (folderId: string): RepositoryMapping[] =>
  settings.value?.mappings.filter(
    (mapping) => mapping.source === 'scan' && mapping.scanFolderId === folderId,
  ) ?? []

const scanErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case NativeHostErrorCode.InvalidRootPath:
      return 'Folder does not exist or cannot be accessed.'
    case NativeHostErrorCode.RootPathNotAbsolute:
      return 'Folder path must be absolute.'
    case NativeHostErrorCode.RootPathNotDirectory:
      return 'The configured path is not a directory.'
    case NativeHostErrorCode.RootPathNotAllowed:
      return 'Scanning a filesystem or drive root is not allowed.'
    case ExtensionNativeErrorCode.NativeHostConnectionFailed:
      return 'Native host is unavailable.'
    case ExtensionNativeErrorCode.InvalidNativeHostResponse:
      return 'Native host returned an invalid response.'
    case RepositoryScanningErrorCode.ScanFolderNotFound:
      return 'Scan folder no longer exists.'
    default:
      return 'Repository scan failed.'
  }
}

const scanFolder = async (folderId: string) => {
  updateFolderState(folderId, { scanning: true, message: '', conflicts: [], skipped: [] })
  try {
    const result = await scanRepositoryFolder(folderId)
    if (!result.ok) {
      updateFolderState(folderId, { scanning: false, message: scanErrorMessage(result.errorCode) })
      return
    }

    updateFolderState(folderId, {
      scanning: false,
      message: `Scan completed. Imported ${result.importedCount} mapping(s).`,
      conflicts: result.conflicts,
      skipped: result.skipped,
    })
    await loadSettings()
  } catch {
    updateFolderState(folderId, { scanning: false, message: 'Repository scan failed.' })
  }
}

const removeFolder = async (folderId: string) => {
  await deleteRepositoryScanFolder(folderId)
  status.value = 'Scan folder deleted. Its mappings were kept as manual mappings.'
  await loadSettings()
}

const removeFolderMappings = async (folderId: string) => {
  await deleteScanFolderMappings(folderId)
  updateFolderState(folderId, { conflicts: [] })
  status.value = 'Mappings from this folder were deleted.'
  await loadSettings()
}

const removeConflict = (folderId: string, conflict: RepositoryScanConflict) => {
  updateFolderState(folderId, {
    conflicts: folderState(folderId).conflicts.filter((item) => item !== conflict),
  })
}

const keepExisting = (folderId: string, conflict: RepositoryScanConflict) => {
  removeConflict(folderId, conflict)
}

const replaceMapping = async (folderId: string, conflict: RepositoryScanConflict) => {
  await replaceMappingWithDiscovered(conflict)
  removeConflict(folderId, conflict)
  await loadSettings()
}

const formatDate = (value: string): string => new Date(value).toLocaleString()

const skippedMessage = (reason: ScanSkippedReason): string =>
  ({
    permission_denied: 'Permission denied',
    missing_git_config: 'Missing Git config',
    invalid_git_config: 'Invalid Git config',
    missing_remote: 'No Git remote',
    unsupported_remote: 'No supported GitHub remote',
    scan_depth_exceeded: 'Maximum scan depth reached',
    unknown_error: 'Could not read directory',
  })[reason]

onMounted(loadSettings)
</script>

<style lang="scss" scoped>
.scan-folders {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid #d8dee4;
  border-radius: 12px;
  background: #ffffff;

  &__header,
  &__details,
  &__nested,
  &__mapping,
  &__conflict {
    display: grid;
    gap: 6px;
  }

  &__title,
  &__text,
  &__status,
  &__empty,
  &__meta,
  &__subtitle,
  &__skipped {
    margin: 0;
  }

  &__title {
    font-size: 18px;
  }

  &__text,
  &__empty,
  &__meta,
  &__mapping span,
  &__conflict span,
  &__skipped {
    color: #59636e;
    font-size: 14px;
  }

  &__add,
  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__input {
    box-sizing: border-box;
    flex: 1;
    min-width: 240px;
    padding: 10px 12px;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    font: inherit;
  }

  &__primary-button,
  &__button {
    padding: 8px 12px;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    font: inherit;
    cursor: pointer;

    &:disabled {
      opacity: 0.7;
      cursor: default;
    }
  }

  &__primary-button {
    border-color: #1f6feb;
    background: #1f6feb;
    color: #ffffff;
  }

  &__button {
    background: #f6f8fa;
  }

  &__card {
    border: 1px solid #d8dee4;
    border-radius: 10px;
    overflow: hidden;
  }

  &__toggle {
    display: flex;
    width: 100%;
    gap: 8px;
    padding: 12px;
    border: 0;
    background: #f6f8fa;
    text-align: left;
    word-break: break-word;
    cursor: pointer;
  }

  &__details {
    padding: 12px;
  }

  &__nested {
    margin-top: 6px;
    padding: 10px;
    border-left: 3px solid #d0d7de;
    background: #f6f8fa;
  }

  &__subtitle {
    font-weight: 600;
  }

  &__mapping,
  &__conflict {
    padding: 8px 0;
    border-top: 1px solid #d8dee4;
    word-break: break-word;
  }
}
</style>
