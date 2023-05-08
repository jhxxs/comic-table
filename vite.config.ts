import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"
import Components from "unplugin-vue-components/vite"
import { NaiveUiResolver } from "unplugin-vue-components/resolvers"
import UnoCSS from "unocss/vite"
import AutoImport from "unplugin-auto-import/vite"
import Icons from "unplugin-icons/vite"

export default defineConfig({
  plugins: [
    Icons({ autoInstall: true }),
    AutoImport({
      imports: ["vue"]
    }),
    Components({
      resolvers: [NaiveUiResolver()]
    }),
    UnoCSS(),
    vue()
  ]
})
