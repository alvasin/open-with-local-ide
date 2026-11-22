import { resolve } from 'node:path'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  vite: () => ({
    resolve: {
      // `source` makes workspace packages (e.g. @open-with-local-ide/protocol) resolve to their
      // TypeScript sources, so the extension does not depend on their build output.
      // The rest are Vite's default client conditions, which an explicit list replaces.
      conditions: ['source', 'module', 'browser', 'development|production'],
    },
  }),
  manifest: {
    // Pinned explicitly: WXT otherwise derives it from the scoped package name.
    name: 'open-with-local-ide',
    permissions: ['storage', 'nativeMessaging'],
  },
  webExt: {
    chromiumProfile: resolve('.wxt/.chrome-data'),
    keepProfileChanges: true,
  },
  srcDir: 'src',
})
