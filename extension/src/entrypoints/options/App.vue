<template>
  <main class="options">
    <header class="options__header">
      <h1 class="options__title">Open With Local IDE Settings</h1>
      <p class="options__subtitle">Configure repo mappings and VS Code command.</p>
    </header>

    <RepoMappingsSection />
    <IdeSettingsSection />
  </main>
</template>

<script lang="ts" setup>
import IdeSettingsSection from './components/sections/IdeSettingsSection.vue'
import RepoMappingsSection from './components/sections/RepoMappingsSection.vue'
</script>

<style lang="scss" scoped>
.options {
  display: grid;
  gap: 20px;
  max-width: 880px;
  margin: 0 auto;
  padding: 24px;

  &__header {
    display: grid;
    gap: 6px;
  }

  &__title {
    margin: 0;
    font-size: 28px;
  }

  &__subtitle {
    margin: 0;
    color: #59636e;
    font-size: 14px;
  }
}
</style>
