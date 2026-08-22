import { dirname } from 'path';
import globals from 'globals';
import { fileURLToPath } from 'url';

import js from '@eslint/js';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import security from 'eslint-plugin-security';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import testingLibrary from 'eslint-plugin-testing-library';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import { FlatCompat } from '@eslint/eslintrc';
import playwright from 'eslint-plugin-playwright';
import vitestPlugin from '@vitest/eslint-plugin';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import next from '@next/eslint-plugin-next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootTsConfigDir = __dirname;

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

// Base configuration factory
export const createBaseConfig = (options: any = {}) => {
  const {
    additionalGlobals = {},
    additionalPlugins = {},
    additionalRules = {},
    filePatterns = ['**/*.{js,jsx,ts,tsx}'],
    tsconfigRootDir = rootTsConfigDir,
  } = options;

  const config = {
    files: filePatterns,
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
          generators: true,
          objectLiteralDuplicateProperties: false,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: tsconfigRootDir,
        projectService: true,
      },
      globals: {
        ...globals.browser,
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        ...additionalGlobals,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
      react: react,
      'react-hooks': reactHooks,
      unicorn: unicorn,
      sonarjs: sonarjs,
      security: security,
      'jsx-a11y': jsxA11y,
      'import-x': importX,
      '@tanstack/query': tanstackQuery,
      '@next/next': next,
      ...additionalPlugins,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: './tsconfig.json',
        }),
      ],
    },
    rules: {
      // Basic rules
      // Let Prettier be the single source of truth for formatting, and let ESLint focus on code quality and correctness. This avoids conflicts and makes maintenance much simpler.
      // "linebreak-style": ["error", "unix"],
      // quotes: ["error", "single", { avoidEscape: true }],
      // semi: ["error", "always"],
      // "max-len": [
      //   "error",
      //   {
      //     code: 120,
      //     ignoreTemplateLiterals: true,
      //     ignoreRegExpLiterals: true,
      //     ignoreStrings: true,
      //     ignoreUrls: true,
      //   },
      // ],
      // "spaced-comment": [2, "always"],

      // React rules
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: false },
      ],
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Development-time relaxed rules
      '@typescript-eslint/no-unused-vars':
        process.env.NODE_ENV === 'production' ? ['error', { argsIgnorePattern: '^_' }] : 'warn',
      '@typescript-eslint/no-explicit-any':
        process.env.NODE_ENV === 'production' ? 'error' : 'warn',

      // import/Export rules
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Built-in modules
            ['^node:(.*)$'],

            // External packages
            [
              '^react$',
              '^react-native$',
              '^@react-native/(.*)$',
              '^react/(.*)$',
              '^next/(.*)$',
              '^@next/(.*)$',
              // '^react-dom/(.*)$',
              '^@?\\w',
            ],

            // Internal packages
            ['^@vera/'],

            // Parent imports
            [
              '^\\.\\.(?!/?$)', // ../something (not ending in / or empty)
              '^\\.\\./?$',
            ], // ../ or ..

            // Sibling imports
            [
              '^\\./(?=.*/)(?!/?$)', // ./something/ (with subdirectory)
              '^\\.(?!/?$)', // ./something (not ending in / or empty)
              '^\\./?$',
            ], // ./ or .

            // Style imports
            ['^.+\\.s?css$'], // .css, .scss files

            //index sort
            [
              '^\\./index$', // ./index
              '^\\.$',
            ], // .

            //object sort
            ['^\\{.*\\}'], // {something} from 'module'

            // Type imports (should be last)
            ['^.*\\u0000$', '^@/(.*)$', '^[./]'],
          ],
          // 'newlines-between': 'always',
          // alphabetize: {order: 'asc', caseInsensitive: true},
        },
      ],
      'simple-import-sort/exports': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-cycle': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-unused-modules': 'off',
      'import-x/newline-after-import': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // General rules
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'prefer-spread': 'error',
      'prefer-destructuring': ['error', { object: true, array: false }],

      // Unicorn rules
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
            pascalCase: true,
            kebabCase: true,
          },
        },
      ],
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-ternary': 'off',
      'unicorn/prefer-top-level-await': 'off',

      // SonarJS rules
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-small-switch': 'off',
      complexity: ['error', 5],
      // Security
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',

      // Performance
      'no-await-in-loop': 'warn',
      'prefer-object-spread': 'error',

      // JSX A11y
      'jsx-a11y/anchor-is-valid': 'off',

      ...tanstackQuery.configs.recommended.rules,
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      // Custom overrides
      ...additionalRules,
    },
  };
  return config;
};

// Test configuration factory
export const createTestConfig = (options: any = {}) => ({
  files: [
    '**/__tests__/**/*',
    '**/*.{test,spec}.{js,jsx,ts,tsx}',
    ...(options.additionalTestFiles || []),
  ],
  languageOptions: {
    globals: {
      ...globals.vitest,
      describe: 'readonly',
      it: 'readonly',
      test: 'readonly',
      expect: 'readonly',
      beforeEach: 'readonly',
      afterEach: 'readonly',
      beforeAll: 'readonly',
      afterAll: 'readonly',
      ...options.additionalGlobals,
    },
  },
  plugins: {
    vitest: vitestPlugin,
    'testing-library': testingLibrary,
    ...options.additionalPlugins,
  },
  rules: {
    ...vitestPlugin.configs.recommended.rules,
    'testing-library/prefer-screen-queries': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'sonarjs/no-duplicate-string': 'off',
    ...options.additionalRules,
  },
});

// // Storybook configuration factory
// export const createStorybookConfig = (options: any = {}) => ({
//   files: ["**/*.stories.{js,jsx,ts,tsx}", ...(options.additionalFiles || [])],
//   rules: {
//     "import-x/no-extraneous-dependencies": "off",
//     "@typescript-eslint/no-explicit-any": "off",
//     ...options.additionalRules,
//   },
// });

// Config files configuration factory
export const createConfigFilesConfig = (options: any = {}) => ({
  files: ['*.config.{js,mjs,cjs}', 'eslint.config.js', ...(options.additionalFiles || [])],
  languageOptions: {
    globals: {
      module: 'writable',
      require: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      process: 'readonly',
      Buffer: 'readonly',
      global: 'readonly',
      ...options.additionalGlobals,
    },
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    'unicorn/prefer-module': 'off',
    ...options.additionalRules,
  },
});

export const defaultIgnoresPath = [
  '**/android/**',
  '**/ios/**',
  '**/*.log',
  '**/*.tsbuildinfo',
  '**/.expo/**',
  '**/.nyc_output/**',
  '**/lib/**',
  '**/dist/**',
  '**/.esbuild/**',
  '**/vite.config.*.timestamp*',
  '**/vitest.config.*.timestamp*',
  '**/test-output',
  '**/build/**',
  '**/coverage/**',
  '**/.serverless',
  '**/node_modules/**',
  '**/bin/**',
  '**/db-prisma-schema/**',
  '**/assets/**',
  '**/.assets/**',
  '**/public/**',
  '**/local/**',
  '**/*.tf',
  '**/yarn/**',
  '**/.husky/**',
  '**/**.cjs',
  '**/storybook-static/**',
  '**/.metro-cache/**',
  '**/DerivedData/**',
  '**/vendor/**',
  '**/*.min.js',
  '**/.next/**',
  '**/venv/**',
  '**/env/**',
  '**/**.env',
  '**/.pytest_cache/**',
  '**/Dockerfile/**',
  '**/.docker/**',
  '**/.vscode/**',
  '**/test-results/**',
  '**/.idea/**',
  '**/platforms/**',
  '**/expo/**',
  '**/tools/**',
  '**/.github/**',
  '**/docs/**',
  '**/.build/**',
  '**/.prettierignore',
  'sonar-project.properties',
  '**/**.md',
  '**/**.json',
  '**/**.lock',
  '**/**.yaml',
  '**/**.yml',
  '.npmrc',
  '.nvmrc',
  '.editorconfig',
  '.gitignore',
  '**/.watchmanconfig',
  '**/Pods/**',
  '**/.detoxrc.js',
  'eslint.config.js',
  'jest.config.js',
  'vite.config.ts',
  'playwright.config.ts',
  '**/*.config.js',
  '**/*.config.ts',
  'eslint.config.mjs',
  '.nx',
  'dist',
  'coverage',
  'build',
  '.next/**',
  'out/**',
  'next-env.d.ts',
  'node_modules',
  'build',
  '**/*.d.ts',
  'env.d.ts',
];

// Default export for root
export default [
  playwright.configs['flat/recommended'],
  js.configs.recommended,
  createTestConfig(),
  // createStorybookConfig(),
  createConfigFilesConfig(),
  createBaseConfig(),
  prettierConfig,
  {
    ignores: defaultIgnoresPath,
  },
];
