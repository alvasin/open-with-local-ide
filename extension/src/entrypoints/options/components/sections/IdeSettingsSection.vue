<template>
  <section class="ide-settings">
    <div class="ide-settings__header">
      <h2 class="ide-settings__title">IDE Settings</h2>
      <p class="ide-settings__text">Set the command used to open files locally.</p>
    </div>

    <label class="ide-settings__field">
      <span class="ide-settings__label">Selected IDE</span>
      <select v-model="selectedIde" class="ide-settings__input">
        <option value="vscode">VS Code</option>
      </select>
    </label>

    <label class="ide-settings__field">
      <span class="ide-settings__label">Command or path</span>
      <input v-model="ideCommand" class="ide-settings__input" type="text" placeholder="code" />
    </label>

    <div class="ide-settings__examples">
      <p class="ide-settings__examples-title">Examples</p>
      <code class="ide-settings__example">code</code>
      <code class="ide-settings__example">
        /Applications/Visual Studio Code.app/Contents/Resources/app/bin/code
      </code>
      <code class="ide-settings__example">
        C:\Users\&lt;user&gt;\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd
      </code>
    </div>

    <button
      class="ide-settings__primary-button"
      type="button"
      :disabled="isSaving"
      @click="saveIde"
    >
      {{ isSaving ? 'Saving...' : 'Save IDE settings' }}
    </button>

    <p v-if="status" class="ide-settings__status">{{ status }}</p>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { getSettings, saveSettings } from '@/settings/settings.storage'
import type { IdeId } from '@/shared/ide/ide.types'

const selectedIde = ref<IdeId>('vscode')
const ideCommand = ref('code')
const status = ref('')
const isSaving = ref(false)

const loadIdeSettings = async () => {
  try {
    const settings = await getSettings()

    selectedIde.value = settings.ide.selectedIde
    ideCommand.value = settings.ide.ideCommands[settings.ide.selectedIde] ?? 'code'
  } catch (error) {
    status.value = error instanceof Error ? error.message : 'Failed to load IDE settings.'
  }
}

const saveIde = async () => {
  const nextCommand = ideCommand.value.trim()

  if (!nextCommand) {
    status.value = 'Command or path is required.'
    return
  }

  isSaving.value = true
  status.value = ''

  try {
    const current = await getSettings()
    await saveSettings({
      ...current,
      ide: {
        selectedIde: selectedIde.value,
        ideCommands: { ...current.ide.ideCommands, [selectedIde.value]: nextCommand },
      },
    })
    await loadIdeSettings()
    status.value = 'IDE settings saved.'
  } catch (error) {
    status.value = error instanceof Error ? error.message : 'Failed to save IDE settings.'
  } finally {
    isSaving.value = false
  }
}

// TODO: add other IDEs when their adapters and native host support are implemented.

onMounted(() => {
  void loadIdeSettings()
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

  &__examples {
    display: grid;
    gap: 8px;
  }

  &__examples-title {
    margin: 0;
    color: #59636e;
    font-size: 13px;
  }

  &__example {
    display: block;
    padding: 10px 12px;
    border: 1px solid #d8dee4;
    border-radius: 8px;
    background: #f6f8fa;
    font-size: 13px;
    word-break: break-word;
  }
}
</style>
