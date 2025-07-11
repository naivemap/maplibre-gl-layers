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
      name: 'ViteLib', // 暴露的全局变量名
      fileName: 'index' // 输出的包文件名
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      // external: ['maplibre-gl'],
      // output: {
      //   // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
      //   globals: {
      //     'maplibre-gl': 'maplibregl'
      //   }
      // }
    }
  },
  plugins: [dts({ insertTypesEntry: true, rollupTypes: false }), vitePluginBundleObfuscator()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src') // 配置别名
    }
  }
})
