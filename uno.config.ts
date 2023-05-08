// uno.config.ts
import { defineConfig } from "unocss"
import { presetMini, transformerDirectives } from "unocss"

export default defineConfig({
  presets: [presetMini()],
  transformers: [transformerDirectives()]
})
