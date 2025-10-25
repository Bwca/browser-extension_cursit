/* ============================================================================
 * Project: CursIt - Cursor IDE Integration for GitHub & Azure DevOps
 * File: browser-extension/tsup.config.ts
 * Purpose: Build configuration for extension scripts bundling
 *
 * Copyright (c) 2025 Volodymyr Yepishev
 *              All rights reserved.
 *
 * Licensed under GNU General Public License v3.0
 * ============================================================================
 */

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/extension-scripts/background.ts', 'src/extension-scripts/content.ts'],
  outDir: 'dist/cursit-chrome-extension/browser',
  format: ['cjs'],
  target: 'esnext',
  splitting: false,
  sourcemap: false,
  minify: true,
  clean: false,
  outExtension: () => ({ js: '.js' }),
});
