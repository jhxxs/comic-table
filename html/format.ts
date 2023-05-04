import fs from "fs"
import path from "path"
import puppeteer from "puppeteer"

export interface Book {
  /** 作品名称 */
  name: string
  /** 作者 */
  author: string[]
  /** 引进方  */
  importer: string
  /**
   * 出版状态
   * - 0 - 未出版
   * - 1 - 已出版
   */
  status: 0 | 1
}

/** 文章链接列表 */
const urls = [
  "https://mp.weixin.qq.com/s/4ZvWjvnJrQwVAiypyetRVQ",
  "https://mp.weixin.qq.com/s/f35XBBT4LQGNybvP3eJNsw",
  "https://mp.weixin.qq.com/s/F39T7S30vl-pvqNcHeu6mg",
  "https://mp.weixin.qq.com/s/b_r6Cug9UKFD7PAFhK3SRg",
  "https://mp.weixin.qq.com/s/U6pdDFme4BXH8xUzUf2ytA"
]

const browser = await puppeteer.launch({ headless: "new" })
const booksList = (
  await Promise.all(
    urls.map(async (url) => {
      const page = await browser.newPage()
      await page.goto(url)
      const booksList = await page.evaluate(getBooks)
      return booksList
    })
  )
).flat()

const booksGroup = groupBy(uniqBy(booksList.reverse(), "name"), "importer")

const books = Object.entries(booksGroup)
  .map(([, val]) => val.sort((a, b) => b.status - a.status))
  .flat()

const importers = [...new Set(Object.keys(booksGroup))].filter((v) => v)
const outputPath = path.resolve(process.cwd(), "src/assets/books.json")

fs.writeFile(outputPath, JSON.stringify({ importers, books }, null, 4), () => {
  browser.close()
})

/**
 * 收集书籍信息
 */
async function getBooks() {
  const reversed = ["小津麻理子"]
  const wronged = ["与妖为邻"]
  const tableList = [...document.querySelectorAll("table")]
  const booksList = tableList.reduce<Book[]>(
    (list, table, tableIndex, tableList) => {
      ;[...table.querySelectorAll("tr")].forEach((tr) => {
        let [nameText = "", authorText = "", importerText = ""] = [
          ...tr.querySelectorAll("td")
        ].map((v) => v.textContent ?? "")

        let name = nameText.trim().replace(/\*/g, "")
        if (reversed.includes(name)) {
          ;[name, authorText] = [authorText, name]
        }

        const author = authorText
          .replace(/\s/g, "")
          .replace(/[，、;]/g, ",")
          .split(",")

        let importer = importerText.replace(/\s/g, "")

        if (wronged.findIndex((v) => name.startsWith(v)) != -1) {
          importer = ""
        }

        if (name !== "作品") {
          list.push({
            name,
            author,
            importer,
            status: tableIndex == tableList.length - 1 ? 1 : 0
          })
        }
      })

      return list
    },
    []
  )

  return booksList
}

/**
 * 分组
 */
function groupBy<T extends Book>(array: T[], iteratee: keyof T) {
  const groups: Record<string, T[]> = {}
  for (const item of array) {
    const key = item[iteratee] as any
    if (!groups.hasOwnProperty(key)) {
      groups[key] = []
    }
    groups[key].push(item)
  }
  return groups
}

/**
 * 去重
 */
function uniqBy<T extends Book>(array: T[], byKey: keyof T) {
  const seen: Record<any, boolean> = {}
  return array.filter((item) => {
    const val = item[byKey] as any
    if (seen.hasOwnProperty(val)) {
      return false
    }
    seen[val] = true
    return true
  })
}
