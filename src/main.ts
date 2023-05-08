import "@unocss/reset/tailwind-compat.css"
import "virtual:uno.css"
import { createApp } from "vue"
import App from "./App.vue"
import "./assets/style.css"
import { inject } from "@vercel/analytics"

inject({
  mode: import.meta.env.DEV ? "development" : "production"
})

const app = createApp(App)

app.mount("#app")
