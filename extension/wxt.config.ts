import { resolve } from 'node:path'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  vite: () => ({
    resolve: {
      alias: {
        '@native-protocol': resolve('../native-host/src/public-api/index.ts'),
      },
    },
  }),
  manifest: {
    permissions: ['storage', 'nativeMessaging'],
  },
  webExt: {
    chromiumProfile: resolve('.wxt/.chrome-data'),
    keepProfileChanges: true,
  },
  srcDir: 'src',
})
