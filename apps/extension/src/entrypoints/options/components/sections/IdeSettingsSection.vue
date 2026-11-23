<template>
  <section class="ide-settings">
    <div class="ide-settings__header">
      <h2 class="ide-settings__title">IDE Settings</h2>
      <p class="ide-settings__text">The native host finds the IDE installation automatically.</p>
    </div>

    <label class="ide-settings__field">
      <span class="ide-settings__label">Selected IDE</span>
      <select v-model="selectedIde" class="ide-settings__input">
        <option value="vscode">VS Code</option>
      </select>
    </label>

    <button class="ide-settings__primary-button" type="button" :disabled="isSaving" @click="saveIde">
      {{ isSaving ? 'Saving...' : 'Save IDE settings' }}
    </button>

    <p v-if="status" class="ide-settings__status">{{ status }}</p>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { getSettings, updateSettings } from '@/settings/settings.storage'
import type { IdeId } from '@/shared/ide/ide.types'

const selectedIde = ref<IdeId>('vscode')
const status = ref('')
const isSaving = ref(false)

const saveIde = async () => {
  isSaving.value = true
  status.value = ''

  try {
    await updateSettings((settings) => {
      settings.ide.selectedIde = selectedIde.value
    })
    status.value = 'IDE settings saved.'
  } catch {
    status.value = 'Failed to save IDE settings.'
  } finally {
    isSaving.value = false
  }
}

// TODO: add other IDEs when their adapters and native host support are implemented.

onMounted(async () => {
  try {
    selectedIde.value = (await getSettings()).ide.selectedIde
  } catch {
    status.value = 'Failed to load IDE settings.'
  }
})
</script>

<style lang="scss" scoped>
.ide-settings {
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

  &__primary-button {
    justify-self: start;
    padding: 10px 14px;
    border: 1px solid #1f6feb;
    border-radius: 8px;
    background: #1f6feb;
    color: #ffffff;
    font: inherit;
    cursor: pointer;

    &:disabled {
      opacity: 0.7;
      cursor: default;
    }
  }

  &__status {
    margin: 0;
    font-size: 14px;
    word-break: break-word;
  }
}
</style>
