import { defineConfig } from 'tsup'

export default defineConfig([
  // Core engine — dual CJS/ESM
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
    outDir: 'dist',
  },
  // Vue composables + TSX components — dual CJS/ESM
  {
    entry: { vue: 'src/vue/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    treeshake: true,
    outDir: 'dist',
    external: ['vue'],
    esbuildOptions(options) {
      options.jsx = 'automatic'
      options.jsxImportSource = 'vue'
    },
  },
  // CLI — ESM only (Node.js)
  {
    entry: { cli: 'src/cli/index.ts' },
    format: ['esm'],
    dts: false,
    sourcemap: true,
    outDir: 'dist',
    banner: { js: '#!/usr/bin/env node' },
  },
])
