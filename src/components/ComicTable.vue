<template>
  <div class="h-full">
    <div
      class="relative px-32px pb-32px pt-24px <sm:px-16px mx-auto max-w-full w-1000px h-full"
    >
      <NInputGroup class="mb-12px">
        <NSelect
          v-model:value="query.search_type"
          :options="searchTypeOptions"
          class="w-80px"
        />
        <NInput
          v-model:value.trim="query.keyword"
          placeholder="关键字搜索"
          clearable
          class="flex-1"
        />
        <NButton @click="reset"> 重置 </NButton>
      </NInputGroup>

      <NDataTable
        ref="tableRef"
        :data="booksFiltered"
        :columns="columns"
        :style="{ height: `${tableMaxHeight}px` }"
        flex-height
      >
      </NDataTable>

      <NBackTop />
      <div
        class="absolute bottom-0 h-32px w-full left-0 text-center flex items-center justify-between <sm:px-16px px-32px bg-white dark:bg-hex-101014"
      >
        <a
          href="https://github.com/jhxxs/comic-table"
          target="_blank"
          :underline="false"
        >
          <GrommetIconsGithub />
        </a>

        <span class="ml-12px text-xs cursor-pointer" @click="visible = true">
          <span>来源：xerobot 公众号</span>
        </span>
      </div>
    </div>

    <NModal v-model:show="visible" close-on-esc mask-closable>
      <NCard
        title="微信扫一扫关注xerobot"
        class="w-300px <sm:w-[calc(100vw-100px)] text-center"
      >
        <div class="text-center">
          <img :src="qrcode" class="inline-block" />
        </div>
      </NCard>
    </NModal>
  </div>
</template>
<script setup lang="ts">
import { useElementSize } from "@vueuse/core"
import type { DataTableColumns, DataTableInst } from "naive-ui"
import { computed, h, ref } from "vue"
import GrommetIconsGithub from "~icons/grommet-icons/github"
import type { Book } from "../../html/format"
import { books, importers } from "../assets/books.json"
import { qrcode } from "../constant"

const visible = ref(false)

const searchTypeOptions = [
  { label: "作品", value: 0 },
  { label: "作者", value: 1 }
]

const query = ref({
  keyword: "",
  search_type: 0
})

const columns: DataTableColumns<Book> = [
  {
    title: () => `📚 作品（${tableRef.value?.paginatedData?.length ?? 0}本）`,
    key: "name"
  },
  {
    title: "✍🏼 作者",
    key: "author",
    render: (row) => row.author.map((v) => h("p", v))
  },
  {
    title: "🏢 引进方",
    key: "importer",
    filterOptions: importers.map((v) => ({ label: v, value: v })),
    filter: (filterValue, row) => {
      // console.log({ filterOptionValue, row })
      return filterValue == row.importer
    }
  },
  {
    title: "🖨️ 已出版？",
    key: "status",
    render: (row) => (row.status == 1 ? "✅" : ""),
    filterMultiple: false,
    filterOptions: [
      { label: "已出版", value: 1 },
      { label: "未出版", value: 0 }
    ],
    filter: (filterValue, row) => filterValue === row.status
  }
]

const booksFiltered = computed(() => {
  const { search_type, keyword } = query.value
  if (!keyword) return books
  if (search_type == 0) {
    return books.filter((v) => v.name.match(keyword))
  } else if (search_type == 1) {
    return books.filter(
      (v) => v.author.findIndex((sv) => sv.match(keyword)) != -1
    )
  }
  return books
})

const tableRef = ref<
  DataTableInst & {
    paginatedData?: any[]
  }
>()
const { height } = useElementSize(document.body, undefined, {})
const tableMaxHeight = computed(() => {
  const value = height.value - 24 - 34 - 12 - 32
  const min = 300
  return value <= min ? min : value
})

function reset() {
  query.value = {
    search_type: 0,
    keyword: ""
  }
  tableRef.value?.clearFilters()
}
</script>
