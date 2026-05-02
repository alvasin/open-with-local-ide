import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import skipFormatting from 'eslint-config-prettier/flat'
import importPlugin from 'eslint-plugin-import'
import pluginVue from 'eslint-plugin-vue'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx,js,mjs,cjs}'],
  },

  // Global ignore
  globalIgnores([
    '.husky/**',
    'examples/**',
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    'commitlint.config.cjs',
  ]),

  // Configuration plugins
  ...pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,

  // Additional plugins
  {
    plugins: { import: importPlugin },
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'unknown'],
          pathGroups: [{ pattern: '**/*.vue', group: 'builtin', position: 'before' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  // Local overrides
  {
    files: ['**/index.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  // Disables formatting rules that conflict with Prettier
  skipFormatting,
)
