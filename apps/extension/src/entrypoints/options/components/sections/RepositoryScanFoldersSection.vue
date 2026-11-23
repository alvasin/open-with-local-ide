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
      <button class="scan-folders__primary-button" type="button" @click="addFolder">Add folder</button>
    </div>

    <p v-if="status" class="scan-folders__status">{{ status }}</p>
    <p v-if="isLoading" class="scan-folders__empty">Loading folders...</p>
    <p v-else-if="folders.length === 0" class="scan-folders__empty">No scan folders configured.</p>

    <ScanFolderCard
      v-for="folder in folders"
      v-else
      :key="folder.id"
      :folder="folder"
      :mappings="folderMappings(folder.id)"
      :initially-expanded="folder.id === addedFolderId"
      @status="actionStatus = $event"
    />
  </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import ScanFolderCard from './ScanFolderCard.vue'
import { useSettings } from '../../composables/use-settings'
import { addRepositoryScanFolder, type AddScanFolderError } from '@/features/repository-scanning'
import type { RepositoryMapping } from '@/settings/settings.schema'

const ADD_FOLDER_ERRORS: Record<AddScanFolderError, string> = {
  required: 'Folder path is required.',
  not_absolute: 'Folder path must be absolute.',
  duplicate: 'This scan folder already exists.',
}

const { settings, isLoading, hasLoadError } = useSettings()

const folderPath = ref('')
const actionStatus = ref('')
const addedFolderId = ref<string>()

const status = computed(() => (hasLoadError.value ? 'Failed to load scan folders.' : actionStatus.value))

const folders = computed(() => settings.value?.repositoryScanFolders ?? [])

const folderMappings = (folderId: string): RepositoryMapping[] =>
  settings.value?.mappings.filter((mapping) => mapping.source === 'scan' && mapping.scanFolderId === folderId) ?? []

const addFolder = async () => {
  try {
    const result = await addRepositoryScanFolder(folderPath.value)

    if (!result.ok) {
      actionStatus.value = ADD_FOLDER_ERRORS[result.reason]
      return
    }

    addedFolderId.value = result.folder.id
    folderPath.value = ''
    actionStatus.value = 'Scan folder added.'
  } catch {
    actionStatus.value = 'Failed to add scan folder.'
  }
}
</script>

<style lang="scss" scoped>
.scan-folders {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid #d8dee4;
  border-radius: 12px;
  background: #ffffff;

  &__header {
    display: grid;
    gap: 6px;
  }

  &__title,
  &__text,
  &__status,
  &__empty {
    margin: 0;
  }

  &__title {
    font-size: 18px;
  }

  &__text,
  &__empty {
    color: #59636e;
    font-size: 14px;
  }

  &__add {
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

  &__primary-button {
    padding: 8px 12px;
    border: 1px solid #1f6feb;
    border-radius: 8px;
    background: #1f6feb;
    color: #ffffff;
    font: inherit;
    cursor: pointer;
  }
}
</style>
