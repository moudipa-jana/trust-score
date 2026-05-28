// ESLint flat config for ESLint v9+
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import pluginTypescriptEslint from '@typescript-eslint/eslint-plugin';
import parserTypescriptEslint from '@typescript-eslint/parser';
import pluginNextNext from '@next/eslint-plugin-next';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': pluginTypescriptEslint,
      prettier: pluginPrettier,
      'simple-import-sort': pluginSimpleImportSort,
      'unused-imports': pluginUnusedImports,
      '@next/next': pluginNextNext,
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'jsx-a11y': pluginJsxA11y,
    },
    languageOptions: {
      parser: parserTypescriptEslint,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        JSX: true,
        React: true,
        console: true,
        process: true,
        fetch: true,
        alert: true,
        window: true,
        document: true,
        Comment: true,
        localStorage: true,
        sessionStorage: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
        requestAnimationFrame: true,
        cancelAnimationFrame: true,
        HTMLElement: true,
        HTMLDivElement: true,
        HTMLInputElement: true,
        HTMLTextAreaElement: true,
        HTMLButtonElement: true,
        HTMLFormElement: true,
        HTMLImageElement: true,
        Event: true,
        MouseEvent: true,
        KeyboardEvent: true,
        PopStateEvent: true,
        IntersectionObserver: true,
        FileReader: true,
        File: true,
        Buffer: true,
        URL: true,
        Node: true,
        NodeJS: true,
        DOMRect: true,
        CSSStyleDeclaration: true,
        location: true,
        history: true,
        navigator: true,
        performance: true,
        EventTarget: true,
        DOMTokenList: true,
        SVGSVGElement: true,
        HTMLVideoElement: true,
        HTMLParagraphElement: true,
        HTMLLIElement: true,
        HTMLAnchorElement: true,
        HTMLUListElement: true,
        IntersectionObserverEntry: true,
        Element: true,
        Image: true,
      },
    },
    rules: {
      // Next.js specific rules
      '@next/next/no-img-element': 'warn',
      '@next/next/no-page-custom-font': 'error',
      '@next/next/no-sync-scripts': 'error',
      '@next/next/no-html-link-for-pages': 'error',

      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      'react/prop-types': 'off', // Using TypeScript
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',

      // Basic JavaScript rules
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'no-redeclare': 'warn',

      // Import sorting and unused imports
      'prettier/prettier': 'warn',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Import rules (turned off the problematic rule)
      'import/prefer-default-export': 'off',

      // Accessibility rules
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
    },
  },
  prettier,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'public/**',
      'docs/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },
];
