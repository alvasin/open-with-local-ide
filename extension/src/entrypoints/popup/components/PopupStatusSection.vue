<template>
  <section v-if="status && currentLocation" class="popup-status">
    <p class="popup-status__text">{{ status }}</p>

    <button
      v-if="shouldShowOpenOptions"
      class="popup-status__secondary-button"
      type="button"
      @click="emit('open-options')"
    >
      Add repo mapping
    </button>
  </section>
</template>

<script lang="ts" setup>
import type { ParsedRemoteLocation } from '@/providers/types'

defineProps<{
  currentLocation: ParsedRemoteLocation | null
  shouldShowOpenOptions: boolean
  status: string
}>()

const emit = defineEmits<{
  'open-options': []
}>()
</script>

<style lang="scss" scoped>
.popup-status {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid #d8dee4;
  border-radius: 8px;
  background: #ffffff;

  &__text {
    margin: 0;
    font-size: 13px;
    word-break: break-word;
  }

  &__secondary-button {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    background: #f6f8fa;
    color: #1f2328;
    font: inherit;
    cursor: pointer;

    &:disabled {
      opacity: 0.7;
      cursor: default;
    }
  }
}
</style>
