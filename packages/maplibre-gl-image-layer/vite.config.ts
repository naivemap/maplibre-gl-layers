import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vitePluginBundleObfuscator from 'vite-plugin-bundle-obfuscator'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ImageLayer',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['maplibre-gl', 'proj4'],
      output: {
        globals: {
          'maplibre-gl': 'maplibregl',
          proj4: 'proj4'
        }
      }
    }
  },
  plugins: [dts({ insertTypesEntry: true, rollupTypes: false }), vitePluginBundleObfuscator()]
})
