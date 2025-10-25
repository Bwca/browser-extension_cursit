// tsup.config.ts
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
