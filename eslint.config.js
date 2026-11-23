import path from 'node:path'
import js from '@eslint/js'
import { configureVueProject, defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import skipFormatting from 'eslint-config-prettier/flat'
import importPlugin from 'eslint-plugin-import'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

const PROTOCOL_IMPORT_RULE = {
  group: ['@open-with-local-ide/protocol/*', '**/packages/protocol/**'],
  message: 'Import the shared protocol only from @open-with-local-ide/protocol.',
}

const nodeGlobals = {
  Buffer: 'readonly',
  console: 'readonly',
  process: 'readonly',
}

// Extension (Vue + WXT). Every config object is scoped to apps/extension via `basePath`.
configureVueProject({ rootDir: path.resolve(import.meta.dirname, 'apps/extension') })

const extensionConfigs = defineConfigWithVueTs(
  globalIgnores(['.output/', '.wxt/', '*.d.ts']),
  {
    name: 'extension/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx,js,mjs,cjs}'],
  },
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
    },
  },
  vueTsConfigs.recommended,
  {
    plugins: { import: importPlugin },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            PROTOCOL_IMPORT_RULE,
            {
              group: ['**/native-host/**', '@open-with-local-ide/native-host'],
              message: 'The extension must not import native-host code.',
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
  {
    files: ['**/index.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
).map((config) => ({ ...config, basePath: 'apps/extension' }))

export default tseslint.config(
  globalIgnores(['**/node_modules/', '**/dist/', '**/*.log', '.codex/', 'claude-design/']),

  // Node.js packages: native host, protocol, and root tooling files.
  {
    files: ['apps/native-host/**/*.{js,ts}', 'packages/protocol/**/*.ts', '*.js'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: nodeGlobals,
    },
  },
  {
    files: ['apps/native-host/**/*.{js,ts}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            PROTOCOL_IMPORT_RULE,
            {
              group: ['**/extension/**', '@open-with-local-ide/extension'],
              message: 'The native host must not import extension code.',
            },
          ],
        },
      ],
    },
  },
  {
    // The protocol is consumed by both the browser and Node.js, so it must stay runtime-neutral.
    files: ['packages/protocol/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['node:*', 'fs', 'path', 'os', 'child_process', 'wxt', 'wxt/*', 'vue'],
              message: 'The protocol package must not depend on Node.js or browser APIs.',
            },
            {
              group: ['@open-with-local-ide/*', '**/apps/**'],
              message: 'The protocol package must not import application code.',
            },
          ],
        },
      ],
    },
  },

  ...extensionConfigs,

  skipFormatting,
)
