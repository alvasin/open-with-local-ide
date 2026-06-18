<template>
  <section class="repo-mappings">
    <div class="repo-mappings__header">
      <h2 class="repo-mappings__title">Repo Mappings</h2>
      <p class="repo-mappings__text">Map `github.com/owner/repo` to a local repo path.</p>
    </div>

    <label class="repo-mappings__field">
      <span class="repo-mappings__label">Repo key</span>
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

      <div
        v-for="mapping in mappings"
        v-else
        :key="mapping.repoKey"
        class="repo-mappings__list-item"
      >
        <div class="repo-mappings__mapping">
          <p class="repo-mappings__mapping-key">{{ mapping.repoKey }}</p>
          <p class="repo-mappings__mapping-path">{{ mapping.localPath }}</p>
        </div>

        <button
          class="repo-mappings__secondary-button"
          type="button"
          :disabled="isSaving"
          @click="removeMapping(mapping.repoKey)"
        >
          Delete
        </button>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { getSettings, saveSettings } from '@/settings/settings.storage'
import type { ExtensionSettings } from '@/settings/settings.types'

const settings = ref<ExtensionSettings | null>(null)
const repoKey = ref('')
const localPath = ref('')
const status = ref('')
const isLoading = ref(true)
const isSaving = ref(false)

const mappings = computed(() => {
  if (!settings.value) return []

  return Object.entries(settings.value.mappings)
    .map(([repoKey, localPath]) => ({ repoKey, localPath }))
    .sort((left, right) => left.repoKey.localeCompare(right.repoKey))
})

const loadMappings = async () => {
  isLoading.value = true

  try {
    settings.value = await getSettings()
  } catch (error) {
    status.value = error instanceof Error ? error.message : 'Failed to load mappings.'
  } finally {
    isLoading.value = false
  }
}

const saveMapping = async () => {
  const nextRepoKey = repoKey.value.trim()
  const nextLocalPath = localPath.value.trim()

  if (!nextRepoKey || !nextLocalPath) {
    status.value = 'Repo key and local path are required.'
    return
  }

  isSaving.value = true
  status.value = ''

  try {
    const current = await getSettings()
    await saveSettings({
      ...current,
      mappings: { ...current.mappings, [nextRepoKey]: nextLocalPath },
    })
    await loadMappings()

    repoKey.value = ''
    localPath.value = ''
    status.value = 'Mapping saved.'
  } catch (error) {
    status.value = error instanceof Error ? error.message : 'Failed to save mapping.'
  } finally {
    isSaving.value = false
  }
}

const removeMapping = async (repoKeyToDelete: string) => {
  isSaving.value = true
  status.value = ''

  try {
    const current = await getSettings()
    const nextMappings = { ...current.mappings }
    delete nextMappings[repoKeyToDelete]

    await saveSettings({ ...current, mappings: nextMappings })
    await loadMappings()
    status.value = 'Mapping deleted.'
  } catch (error) {
    status.value = error instanceof Error ? error.message : 'Failed to delete mapping.'
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

  &__header {
    display: grid;
    gap: 4px;
  }

  &__title {
    margin: 0;
    font-size: 18px;
  }

  &__text {
    margin: 0;
    color: #59636e;
    font-size: 14px;
  }

  &__field {
    display: grid;
    gap: 6px;
  }

  &__label {
    color: #59636e;
    font-size: 13px;
  }

  &__input {
    box-sizing: border-box;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    background: #ffffff;
    color: #1f2328;
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
    color: #1f2328;
  }

  &__status {
    margin: 0;
    font-size: 14px;
    word-break: break-word;
  }

  &__list {
    display: grid;
    gap: 10px;
  }

  &__empty {
    margin: 0;
    color: #59636e;
    font-size: 14px;
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

  &__mapping {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  &__mapping-key,
  &__mapping-path {
    margin: 0;
    word-break: break-word;
  }

  &__mapping-key {
    font-weight: 600;
  }

  &__mapping-path {
    color: #59636e;
    font-size: 14px;
  }
}
</style>
