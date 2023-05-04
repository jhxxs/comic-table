<template>
  <div class="h-full">
    <div
      ref="wrapperRef"
      class="relative px-32px pb-32px pt-24px <sm:px-16px mx-auto max-w-full w-1000px h-full"
    >
      <div class="flex items-center justify-between gap-x-12px">
        <el-input
          v-model.trim="query.keyword"
          placeholder="关键字搜索"
          clearable
          class="flex-1"
        >
          <template #prepend>
            <el-select v-model="query.search_type" class="w-80px">
              <el-option
                v-for="item in searchTypeOptions"
                class="mr-8px"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-input>
        <el-button @click="reset"> 重置 </el-button>
      </div>
      <el-table
        ref="tableRef"
        :data="booksFiltered"
        class="mt-12px"
        stripe
        :max-height="tableMaxHeight"
        table-layout="auto"
      >
        <el-table-column label="📚 作品" v-slot="{ row }">
          {{ row.name }}
        </el-table-column>

        <el-table-column label="✍🏼 作者" v-slot="{ row }" prop="author">
          <p v-for="item in row.author" :key="item">
            {{ item }}
          </p>
        </el-table-column>

        <el-table-column
          v-slot="{ row }"
          label="🏢 引进方"
          prop="importer"
          :filters="importerFilters"
          :filter-method="handleFilter"
        >
          {{ row.importer }}
        </el-table-column>

        <el-table-column
          label="🖨️ 已出版？"
          prop="status"
          :filters="statusFilters"
          :filter-method="handleFilter"
          :filter-multiple="false"
        >
          <template #header>
            🖨️ <span class="<sm:hidden">已出版？</span>
          </template>
          <template v-slot="{ row }">
            {{ row.status == 1 ? "✅" : "" }}
          </template>
        </el-table-column>
      </el-table>
      <el-backtop />
      <div
        class="absolute bottom-0 h-32px w-full left-0 text-center flex items-center justify-between <sm:px-16px px-32px"
      >
        <el-link
          href="https://github.com/jhxxs/comic-table"
          target="_blank"
          :underline="false"
        >
          <img :src="icon" class="inline-block w-18px h-18px cursor-pointer" />
        </el-link>
        <span class="ml-12px text-xs cursor-pointer" @click="visible = true">
          <el-text class="mx-1" type="info">
            <span>来源：xerobot 公众号</span></el-text
          >
        </span>
      </div>
    </div>

    <el-dialog v-model="visible" center title="微信扫一扫关注xerobot">
      <div class="text-center">
        <img :src="qrcode" class="inline-block" />
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { useElementSize } from "@vueuse/core"
import type { TableColumnCtx, TableInstance } from "element-plus"
import { computed, nextTick, ref } from "vue"
import type { Book } from "../../html/format"
import { books, importers } from "../assets/books.json"
import icon from "../assets/github.svg"
import qrcode from "../assets/qrcode.png"

const visible = ref(false)
const importerFilters = importers.map((v) => ({ text: v, value: v }))
const statusFilters = [
  { text: "已出版", value: 1 },
  { text: "未出版", value: 0 }
]

const searchTypeOptions = [
  { text: "作品", value: 0 },
  { text: "作者", value: 1 }
]

const query = ref({
  keyword: "",
  search_type: 0
})

function handleFilter(value: string, row: Book, column: TableColumnCtx<Book>) {
  const property = column["property"] as keyof Book
  // console.log(row[property], value)
  return row[property] === value
}

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

const wrapperRef = ref<HTMLElement>()
const tableRef = ref<TableInstance>()
const { height } = useElementSize(wrapperRef, undefined, {})
const tableMaxHeight = computed(() => {
  const value = height.value - 32 - 12
  nextTick(() => tableRef.value?.doLayout())
  return value <= 500 ? 500 : value
})

function reset() {
  query.value = {
    search_type: 0,
    keyword: ""
  }
  tableRef.value
    // @ts-expect-error
    ?.clearFilter()
}
</script>
