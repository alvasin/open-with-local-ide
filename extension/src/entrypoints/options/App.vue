<template>
  <main class="options">
    <header class="options__header">
      <h1 class="options__title">Open With Local IDE Settings</h1>
      <p class="options__subtitle">Discover repositories and configure VS Code.</p>
    </header>

    <RepositoryScanFoldersSection />
    <RepoMappingsSection />
    <IdeSettingsSection />
  </main>
</template>

<script lang="ts" setup>
import IdeSettingsSection from './components/sections/IdeSettingsSection.vue'
import RepoMappingsSection from './components/sections/RepoMappingsSection.vue'
import RepositoryScanFoldersSection from './components/sections/RepositoryScanFoldersSection.vue'
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
