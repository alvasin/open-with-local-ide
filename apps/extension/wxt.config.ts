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
    // Public key that pins the unpacked extension ID to cmlcpcbhmjmapaojcnfpcecmfcpbopho regardless
    // of the folder it is loaded from. The native host manifest allows exactly this ID.
    // Remove it before uploading to the Chrome Web Store, which assigns its own key.
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9x/xqjAL4ITROn1sewlw8BxswscPcu+0ne1gYoKLzJWeH1Msplw2MDRX9j6chRry6+6Htlp9ZV0R1BE0bkGiZpaK7V7jIKIiOpAeEBx7mY1iyUWrG+2J+nYNwolkW5hY9Gyu12CQSAfChI1rLb2ImGgXjKfNzKN/vYAOv3dTvNEn+TKfPfs23nf6Vwl9lSgvkie51NRPkEcaHvbAotstSWRx/zGtLfHpu6wVYedshoulysZk8VznQ2clhXkLc5vM7P/kn4hEMMoIMN3CAkBmWE1/B4LeaY8zVspJK6MogrUw7S1RrcN8Sm6+ysm7H+/6rSEARvw3CpHhS4LAtrFLGQIDAQAB',
    permissions: ['storage', 'nativeMessaging'],
  },
  webExt: {
    chromiumProfile: resolve('.wxt/.chrome-data'),
    keepProfileChanges: true,
  },
  srcDir: 'src',
})
