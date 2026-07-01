<template>
  <section class="current-location">
    <p v-if="isLoading || !currentLocation" class="current-location__status">
      {{ isLoading ? 'Loading current tab...' : status }}
    </p>

    <template v-else>
      <dl class="current-location__details">
        <div class="current-location__detail">
          <dt>Repository</dt>
          <dd>{{ currentLocation.repoKey }}</dd>
        </div>

        <div class="current-location__detail">
          <dt>
            {{
              currentLocation.filePath
                ? 'File'
                : currentLocation.directoryPath
                  ? 'Folder'
                  : 'Target'
            }}
          </dt>
          <dd>
            {{ currentLocation.filePath ?? currentLocation.directoryPath ?? 'Repository root' }}
          </dd>
        </div>

        <div class="current-location__detail">
          <dt>Line</dt>
          <dd>{{ currentLocation.line ?? '-' }}</dd>
        </div>

        <div class="current-location__detail">
          <dt>IDE</dt>
          <dd>{{ selectedIdeLabel }}</dd>
        </div>
      </dl>

      <button
        class="current-location__primary-button"
        type="button"
        :disabled="isOpening"
        @click="emit('open-current-location')"
      >
        {{ isOpening ? 'Opening...' : `Open with ${selectedIdeLabel}` }}
      </button>
    </template>
  </section>
</template>

<script lang="ts" setup>
import type { ParsedRemoteLocation } from '@/providers/types'

defineProps<{
  currentLocation: ParsedRemoteLocation | null
  isLoading: boolean
  isOpening: boolean
  selectedIdeLabel: string
  status: string
}>()

const emit = defineEmits<{
  'open-current-location': []
}>()
</script>

<style lang="scss" scoped>
.current-location {
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
