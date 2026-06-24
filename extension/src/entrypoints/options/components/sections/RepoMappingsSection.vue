<template>
  <section class="repo-mappings">
    <div class="repo-mappings__header">
      <h2 class="repo-mappings__title">Repository mappings</h2>
      <p class="repo-mappings__text">Map github.com/owner/repo to a local repository path.</p>
    </div>

    <label class="repo-mappings__field">
      <span class="repo-mappings__label">Repository</span>
      <input
        v-model="repoKey"
        class="repo-mappings__input"
        type="text"
        placeholder="github.com/org/repo"
      />
    </label>

    <label class="repo-mappings__field">
      <span class="repo-mappings__label">Local path</span>
      <input
        v-model="localPath"
        class="repo-mappings__input"
        type="text"
        placeholder="/absolute/path/to/repo"
      />
    </label>

    <button
      class="repo-mappings__primary-button"
      type="button"
      :disabled="isSaving"
      @click="saveMapping"
    >
      {{ isSaving ? 'Saving...' : 'Save mapping' }}
    </button>

    <p v-if="status" class="repo-mappings__status">{{ status }}</p>

    <div class="repo-mappings__list">
      <p v-if="isLoading" class="repo-mappings__empty">Loading mappings...</p>
      <p v-else-if="mappings.length === 0" class="repo-mappings__empty">No mappings saved yet.</p>

      <div v-for="mapping in mappings" v-else :key="mapping.id" class="repo-mappings__list-item">
        <div class="repo-mappings__mapping">
          <p class="repo-mappings__mapping-key">{{ getRepositoryKey(mapping) }}</p>
          <p class="repo-mappings__mapping-path">{{ mapping.repoPath }}</p>
          <span class="repo-mappings__source">{{ mapping.source }}</span>
        </div>

        <button
          class="repo-mappings__secondary-button"
          type="button"
          :disabled="isSaving"
          @click="removeMapping(mapping.id)"
        >
          Delete
        </button>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import {
  deleteRepositoryMapping,
  saveManualMapping,
} from '@/features/repository-mappings/repository-mappings'
import { getRepositoryKey } from '@/settings/mappings/mappings'
import { getSettings } from '@/settings/settings.storage'
import type { ExtensionSettings } from '@/settings/settings.types'

const settings = ref<ExtensionSettings | null>(null)
const repoKey = ref('')
const localPath = ref('')
const status = ref('')
const isLoading = ref(true)
const isSaving = ref(false)

const mappings = computed(() =>
  [...(settings.value?.mappings ?? [])].sort((left, right) =>
    getRepositoryKey(left).localeCompare(getRepositoryKey(right)),
  ),
)

const loadMappings = async () => {
  isLoading.value = true
  try {
    settings.value = await getSettings()
  } catch {
    status.value = 'Failed to load mappings.'
  } finally {
    isLoading.value = false
  }
}

const saveMapping = async () => {
  const match = repoKey.value.trim().match(/^github\.com\/([^/]+)\/([^/]+)$/i)
  const nextLocalPath = localPath.value.trim()

  if (!match?.[1] || !match[2] || !nextLocalPath) {
    status.value = 'Enter github.com/owner/repo and a local path.'
    return
  }

  isSaving.value = true
  status.value = ''
  try {
    await saveManualMapping({
      owner: match[1],
      repo: match[2],
      repoPath: nextLocalPath,
    })
    await loadMappings()
    repoKey.value = ''
    localPath.value = ''
    status.value = 'Mapping saved.'
  } catch {
    status.value = 'Failed to save mapping.'
  } finally {
    isSaving.value = false
  }
}

const removeMapping = async (mappingId: string) => {
  isSaving.value = true
  status.value = ''
  try {
    await deleteRepositoryMapping(mappingId)
    await loadMappings()
    status.value = 'Mapping deleted.'
  } catch {
    status.value = 'Failed to delete mapping.'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  repoKey.value = new URLSearchParams(window.location.search).get('repoKey') ?? ''
  void loadMappings()
})
</script>

<style lang="scss" scoped>
.repo-mappings {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid #d8dee4;
  border-radius: 12px;
  background: #ffffff;

  &__header,
  &__mapping {
    display: grid;
    gap: 4px;
  }

  &__title,
  &__text,
  &__status,
  &__empty,
  &__mapping-key,
  &__mapping-path {
    margin: 0;
  }

  &__title {
    font-size: 18px;
  }

  &__text,
  &__label,
  &__empty,
  &__mapping-path {
    color: #59636e;
    font-size: 14px;
  }

  &__field {
    display: grid;
    gap: 6px;
  }

  &__input {
    box-sizing: border-box;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    font: inherit;
  }

  &__primary-button,
  &__secondary-button {
    padding: 10px 14px;
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
    justify-self: start;
    border-color: #1f6feb;
    background: #1f6feb;
    color: #ffffff;
  }

  &__secondary-button {
    background: #f6f8fa;
  }

  &__list {
    display: grid;
    gap: 10px;
  }

  &__list-item {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 12px;
    padding: 12px;
    border: 1px solid #d8dee4;
    border-radius: 10px;
    background: #f6f8fa;
  }

  &__mapping-key {
    font-weight: 600;
  }

  &__mapping-key,
  &__mapping-path {
    word-break: break-word;
  }

  &__source {
    justify-self: start;
    padding: 2px 7px;
    border-radius: 999px;
    background: #ddf4ff;
    color: #0969da;
    font-size: 12px;
  }
}
</style>
