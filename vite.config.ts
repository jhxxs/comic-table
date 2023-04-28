import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import UnoCSS from "unocss/vite"

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    UnoCSS(),
    vue()
  ]
})
