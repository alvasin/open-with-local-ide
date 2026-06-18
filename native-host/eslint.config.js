import js from '@eslint/js'
import skipFormatting from 'eslint-config-prettier/flat'
import tseslint from 'typescript-eslint'

const nodeGlobals = {
  Buffer: 'readonly',
  console: 'readonly',
  process: 'readonly',
}

export default tseslint.config(
  {
    ignores: ['node_modules/', 'dist/', '*.log'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      globals: nodeGlobals,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['#native-protocol/*'],
              message: 'Import the native host public API only from #native-protocol.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  skipFormatting,
)
