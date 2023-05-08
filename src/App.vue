<template>
  <NConfigProvider
    :theme="theme"
    :locale="zhCN"
    :date-locale="dateZhCN"
    abstract
  >
    <ComicTable />
  </NConfigProvider>
</template>
<script setup lang="ts">
import ComicTable from "./components/ComicTable.vue"
import { darkTheme, zhCN, dateZhCN, useOsTheme } from "naive-ui"
const osThemeRef = useOsTheme()
const theme = computed(() => (osThemeRef.value === "dark" ? darkTheme : null))
const isDarMode = computed(() => osThemeRef.value === "dark")

watch(
  isDarMode,
  (val) => {
    if (val) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  },
  {
    immediate: true
  }
)
</script>
