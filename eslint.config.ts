import { fileURLToPath, URL } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';

import globals from 'globals';
import { globalIgnores } from 'eslint/config';
import {
  defineConfigWithVueTs, vueTsConfigs, configureVueProject,
} from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
import pluginOxlint from 'eslint-plugin-oxlint';
import eslintPluginVueScopedCSS from 'eslint-plugin-vue-scoped-css';

import { configs as airbnbConfigs } from 'eslint-config-airbnb-extended';

import { importX } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

import stylistic from '@stylistic/eslint-plugin';

// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup
configureVueProject({
  tsSyntaxInTemplates: true,
  scriptLangs: ['ts', 'js'],
  allowComponentTypeUnsafety: true,
});

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

const OFF = 'off';
// const WARN = 'warn';
const ERROR = 'error';

const eslintPluginVueScopedCSSConfig: any = eslintPluginVueScopedCSS.configs['flat/recommended'];
export default defineConfigWithVueTs(
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),
  vueTsConfigs.recommendedTypeChecked,
  pluginVue.configs['flat/recommended'],
  ...pluginOxlint.configs['flat/recommended'],
  ...eslintPluginVueScopedCSSConfig,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  stylistic.configs['disable-legacy'],
  stylistic.configs['recommended-flat'],
  airbnbConfigs.base.recommended,
  airbnbConfigs.base.typescript,
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    settings: {
      'import-x/resolver-next': createTypeScriptImportResolver({
        // for import-x/no-unresolved (`tsconfig.app.json`.`compilerOptions`.`paths`)
        // NOTE: not using noWarnOnMultipleProjects
        // project: 'tsconfig.{app,node}.json',
        project: 'tsconfig.json',
      }),
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? ERROR : OFF,
      'no-debugger': process.env.NODE_ENV === 'production' ? ERROR : OFF,

      // https://eslint.style/rules/semi
      '@stylistic/semi': [ERROR, 'always'],

      // import-x
      'import-x/no-commonjs': ERROR,
      'import-x/no-extraneous-dependencies': ERROR,

      'import-x/no-unresolved': ERROR,

      'import-x/extensions': [
        ERROR,
        'always',
        {
          js: 'never',
          ts: 'never',
        },
      ],

      // vue
      'vue/max-attributes-per-line': [ERROR, {
        singleline: 3,
        multiline: 1,
      }],
      'vue/attributes-order': ERROR,
      'vue/singleline-html-element-content-newline': ERROR,
      'vue/no-v-model-argument': OFF,
    },
  },
  {
    name: 'app/configs',
    files: ['*.config.*'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'import-x/no-extraneous-dependencies': OFF,
    },
  },
);
