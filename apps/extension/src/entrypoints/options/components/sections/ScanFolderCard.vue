<template>
  <article class="scan-folder">
    <button class="scan-folder__toggle" type="button" @click="isExpanded = !isExpanded">
      <span>{{ isExpanded ? '▾' : '▸' }}</span>
      <strong>{{ folder.path }}</strong>
    </button>

    <div v-if="isExpanded" class="scan-folder__details">
      <p class="scan-folder__meta">
        Last scan: {{ folder.lastScannedAt ? formatDate(folder.lastScannedAt) : 'never' }}
      </p>

      <div class="scan-folder__actions">
        <button class="scan-folder__primary-button" type="button" :disabled="isScanning" @click="scan">
          {{ isScanning ? 'Scanning...' : 'Scan' }}
        </button>
        <button class="scan-folder__button" type="button" @click="removeFolder">Delete folder</button>
        <button v-if="mappings.length" class="scan-folder__button" type="button" @click="removeMappings">
          Delete mappings
        </button>
      </div>

      <p v-if="message" class="scan-folder__status">{{ message }}</p>

      <div v-if="mappings.length" class="scan-folder__nested">
        <p class="scan-folder__subtitle">Active mappings</p>
        <div v-for="mapping in mappings" :key="mapping.id" class="scan-folder__mapping">
          <strong>✓ {{ getRepositoryKey(mapping) }}</strong>
          <span>{{ mapping.repoPath }}</span>
        </div>
      </div>

      <div v-if="conflicts.length" class="scan-folder__nested">
        <p class="scan-folder__subtitle">Conflicts</p>
        <div v-for="conflict in conflicts" :key="conflict.existing.id" class="scan-folder__conflict">
          <strong>{{ getRepositoryKey(conflict.existing) }}</strong>
          <span>Existing: {{ conflict.existing.repoPath }}</span>
          <span>Discovered: {{ conflict.discovered.repoPath }}</span>
          <div class="scan-folder__actions">
            <button class="scan-folder__button" type="button" @click="dismissConflict(conflict)">Keep existing</button>
            <button class="scan-folder__button" type="button" @click="replaceMapping(conflict)">Replace</button>
          </div>
        </div>
      </div>

      <div v-if="skipped.length" class="scan-folder__nested">
        <p class="scan-folder__subtitle">Skipped entries ({{ skipped.length }})</p>
        <p
          v-for="entry in skipped.slice(0, MAX_VISIBLE_SKIPPED)"
          :key="`${entry.path}:${entry.reason}`"
          class="scan-folder__skipped"
        >
          {{ SKIPPED_REASON_LABELS[entry.reason] }}: {{ entry.path }}
        </p>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import type { ScanSkippedEntry, ScanSkippedReason } from '@open-with-local-ide/protocol'
import { ref } from 'vue'
import {
  deleteRepositoryScanFolder,
  deleteScanFolderMappings,
  replaceMappingWithDiscovered,
  scanRepositoryFolder,
  type RepositoryScanConflict,
} from '@/features/repository-scanning'
import { getRepositoryKey } from '@/providers/repository'
import type { RepositoryMapping } from '@/settings/settings.schema'
import type { RepositoryScanFolder } from '@/settings/settings.schema'
import { getUiError } from '@/shared/ui-errors/ui-errors'

const MAX_VISIBLE_SKIPPED = 10

const SKIPPED_REASON_LABELS: Record<ScanSkippedReason, string> = {
  permission_denied: 'Permission denied',
  missing_git_config: 'Missing Git config',
  invalid_git_config: 'Invalid Git config',
  missing_remote: 'No Git remote',
  unsupported_remote: 'No supported GitHub remote',
  scan_depth_exceeded: 'Maximum scan depth reached',
  unknown_error: 'Could not read directory',
}

const props = defineProps<{
  folder: RepositoryScanFolder
  /** Mappings imported from this folder. */
  mappings: RepositoryMapping[]
  initiallyExpanded: boolean
}>()

const emit = defineEmits<{
  status: [message: string]
}>()

const isExpanded = ref(props.initiallyExpanded)
const isScanning = ref(false)
const message = ref('')
const conflicts = ref<RepositoryScanConflict[]>([])
const skipped = ref<ScanSkippedEntry[]>([])

const formatDate = (value: string): string => new Date(value).toLocaleString()

const scan = async () => {
  isScanning.value = true
  message.value = ''
  conflicts.value = []
  skipped.value = []

  try {
    const result = await scanRepositoryFolder(props.folder.id)

    if (!result.ok) {
      message.value = getUiError(result.errorCode).message
      return
    }

    message.value = `Scan completed. Imported ${result.importedCount} mapping(s).`
    conflicts.value = result.conflicts
    skipped.value = result.skipped
  } catch {
    message.value = 'Repository scan failed.'
  } finally {
    isScanning.value = false
  }
}

const removeFolder = async () => {
  try {
    await deleteRepositoryScanFolder(props.folder.id)
    emit('status', 'Scan folder deleted. Its mappings were kept as manual mappings.')
  } catch {
    message.value = 'Failed to delete scan folder.'
  }
}

const removeMappings = async () => {
  try {
    await deleteScanFolderMappings(props.folder.id)
    conflicts.value = []
    emit('status', 'Mappings from this folder were deleted.')
  } catch {
    message.value = 'Failed to delete mappings.'
  }
}

const dismissConflict = (conflict: RepositoryScanConflict) => {
  conflicts.value = conflicts.value.filter((item) => item !== conflict)
}

const replaceMapping = async (conflict: RepositoryScanConflict) => {
  try {
    await replaceMappingWithDiscovered(conflict)
    dismissConflict(conflict)
  } catch {
    message.value = 'Failed to replace mapping.'
  }
}
</script>

<style lang="scss" scoped>
.scan-folder {
  border: 1px solid #d8dee4;
  border-radius: 10px;
  overflow: hidden;

  &__details,
  &__nested,
  &__mapping,
  &__conflict {
    display: grid;
    gap: 6px;
  }

  &__status,
  &__meta,
  &__subtitle,
  &__skipped {
    margin: 0;
  }

  &__meta,
  &__mapping span,
  &__conflict span,
  &__skipped {
    color: #59636e;
    font-size: 14px;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
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
