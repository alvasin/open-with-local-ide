import { onMounted, onUnmounted, ref } from 'vue'
import type { ExtensionSettings } from '@/settings/settings.schema'
import { getSettings, subscribeSettings } from '@/settings/settings.storage'

/** Reactive settings that stay in sync when another section or extension page changes them. */
export const useSettings = () => {
  const settings = ref<ExtensionSettings | null>(null)
  const isLoading = ref(true)
  const hasLoadError = ref(false)

  let unsubscribe: (() => void) | undefined

  onMounted(async () => {
    unsubscribe = subscribeSettings((nextSettings) => {
      settings.value = nextSettings
    })

    try {
      settings.value = await getSettings()
    } catch {
      hasLoadError.value = true
    } finally {
      isLoading.value = false
    }
  })

  onUnmounted(() => unsubscribe?.())

  return { settings, isLoading, hasLoadError }
}
