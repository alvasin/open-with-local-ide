<template>
  <header class="popup-header">
    <div class="popup-header__copy">
      <h1 class="popup-header__title">Open With Local IDE</h1>
      <p class="popup-header__subtitle">GitHub file to local IDE</p>
    </div>

    <button
      class="popup-header__settings-button"
      type="button"
      aria-label="Open settings"
      @click="emit('open-options')"
    >
      <span aria-hidden="true">&#9881;</span>
    </button>
  </header>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  'open-options': []
}>()
</script>

<style lang="scss" scoped>
.popup-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;

  &__copy {
    display: grid;
    gap: 4px;
  }

  &__title {
    margin: 0;
    font-size: 16px;
  }

  &__subtitle {
    margin: 0;
    color: #59636e;
    font-size: 13px;
  }

  &__settings-button {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    background: #f6f8fa;
    color: #1f2328;
    font: inherit;
    cursor: pointer;
  }
}
</style>
