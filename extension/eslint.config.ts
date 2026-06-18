import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import skipFormatting from 'eslint-config-prettier/flat'
import importPlugin from 'eslint-plugin-import'
import pluginVue from 'eslint-plugin-vue'

export default defineConfigWithVueTs(
  // Global ignore
  globalIgnores([
    'node_modules/',
    'dist/',
    '.output/',
    '.wxt/',
    'coverage/',
    '.husky/',
    'examples/',
    '*.log',
    '*.d.ts',
    'commitlint.config.cjs',
  ]),

  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx,js,mjs,cjs}'],
  },

  // Vue
  ...pluginVue.configs['flat/recommended'],

  {
    rules: {
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
    },
  },

  // TS
  vueTsConfigs.recommended,

  // Plugins
  {
    plugins: { import: importPlugin },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@native-protocol/*',
                '../native-host/src/**',
                '../../native-host/src/**',
                '../../../native-host/src/**',
                '../../../../native-host/src/**',
              ],
              message:
                'Import the native host public API only from @native-protocol; deep imports from native-host/src are not allowed.',
            },
          ],
        },
      ],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'unknown'],
          pathGroups: [
            {
              pattern: '**/*.vue',
              group: 'builtin',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  // Overrides
  {
    files: ['**/index.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  skipFormatting,
)
