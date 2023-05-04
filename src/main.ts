import "@unocss/reset/tailwind.css"
import "virtual:uno.css"
import { createApp } from "vue"
import App from "./App.vue"
import "./assets/style.css"
import ElementPlus from "element-plus"
import zhCn from "element-plus/dist/locale/zh-cn.mjs"
import "element-plus/theme-chalk/dark/css-vars.css"
import { inject } from "@vercel/analytics"

inject()

const app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn
})

app.mount("#app")
