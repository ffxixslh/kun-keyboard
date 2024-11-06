import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import parserTs from '@typescript-eslint/parser'

export default tseslint.config(
  stylistic.configs['recommended-flat'],
  {
    ignores: ['dist'],
  },
  {
    extends: [
      stylistic.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: parserTs,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@stylistic': stylistic,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],
    },
  },
  {
    rules: {
      '@stylistic/max-len': ['error', { code: 80 }],
      '@stylistic/indent': ['error', 2],
      '@stylistic/semi-style': ['error', 'first'],
      '@stylistic/quotes': ['error'],
      '@stylistic/brace-style': ['error', 'stroustrup', {
        allowSingleLine: false,
      }],
      '@stylistic/no-multiple-empty-lines': ['error', {
        max: 2,
        maxEOF: 0,
      }],
      '@stylistic/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always', prev: '*', next: 'return',
        },
      ],
    },
  },
  {
    rules: {
      '@typescript-eslint/no-misused-promises': ['error', {
        checksVoidReturn: false,
      }],
    },
  },
)
