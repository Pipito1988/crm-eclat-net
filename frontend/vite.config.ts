import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Melhor suporte para TypeScript no build
    target: 'es2022',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  esbuild: {
    // Type checking via esbuild (mais rápido que tsc)
    target: 'es2022',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
