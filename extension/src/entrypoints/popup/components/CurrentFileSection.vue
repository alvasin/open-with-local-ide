<template>
  <section class="current-file">
    <p v-if="isLoading || !currentFile" class="current-file__status">
      {{ isLoading ? 'Loading current tab...' : status }}
    </p>

    <template v-else>
      <dl class="current-file__details">
        <div class="current-file__detail">
          <dt>Repository</dt>
          <dd>{{ currentFile.repoKey }}</dd>
        </div>

        <div class="current-file__detail">
          <dt>{{ currentFile.filePath ? 'File' : 'Target' }}</dt>
          <dd>{{ currentFile.filePath ?? 'Repository root' }}</dd>
        </div>

        <div class="current-file__detail">
          <dt>Line</dt>
          <dd>{{ currentFile.line ?? '-' }}</dd>
        </div>

        <div class="current-file__detail">
          <dt>IDE</dt>
          <dd>{{ selectedIdeLabel }}</dd>
        </div>
      </dl>

      <button
        class="current-file__primary-button"
        type="button"
        :disabled="isOpening"
        @click="emit('open-current-file')"
      >
        {{ isOpening ? 'Opening...' : `Open with ${selectedIdeLabel}` }}
      </button>
    </template>
  </section>
</template>

<script lang="ts" setup>
import type { ParsedRemoteFile } from '@/providers/types'

defineProps<{
  currentFile: ParsedRemoteFile | null
  isLoading: boolean
  isOpening: boolean
  selectedIdeLabel: string
  status: string
}>()

const emit = defineEmits<{
  'open-current-file': []
}>()
</script>

<style lang="scss" scoped>
.current-file {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid #d8dee4;
  border-radius: 8px;
  background: #ffffff;

  &__details {
    display: grid;
    gap: 8px;
    margin: 0;
  }

  &__detail {
    display: grid;
    gap: 2px;

    dt {
      color: #59636e;
      font-size: 12px;
    }

    dd {
      margin: 0;
      font-size: 13px;
      word-break: break-word;
    }
  }

  &__primary-button {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #1f6feb;
    border-radius: 6px;
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
    font-size: 13px;
    word-break: break-word;
  }
}
</style>
