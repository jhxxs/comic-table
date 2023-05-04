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

const urls = [
  "https://mp.weixin.qq.com/s/4ZvWjvnJrQwVAiypyetRVQ",
  "https://mp.weixin.qq.com/s/f35XBBT4LQGNybvP3eJNsw",
  "https://mp.weixin.qq.com/s/F39T7S30vl-pvqNcHeu6mg",
  "https://mp.weixin.qq.com/s/b_r6Cug9UKFD7PAFhK3SRg",
  "https://mp.weixin.qq.com/s/U6pdDFme4BXH8xUzUf2ytA"
]

const browser = await puppeteer.launch({ headless: false })
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

const books = Object.entries(groupBy(uniqBy(booksList, "name"), "importer"))
  .map(([, val]) => val.sort((a, b) => b.status - a.status))
  .flat()

const importers = [...new Set(books.map((v) => v.importer))].filter((v) => v)
const outputPath = path.resolve(process.cwd(), "src/assets/books.json")

fs.writeFile(outputPath, JSON.stringify({ importers, books }, null, 4), () => {
  browser.close()
})

/**
 * 收集书籍信息
 */
async function getBooks() {
  const tableList = [...document.querySelectorAll("table")]
  const booksList = tableList.reduce<Book[]>(
    (list, table, tableIndex, tableList) => {
      const [, ...trArr] = [...table.querySelectorAll("tr")]
      const bookArr = trArr.map<Book>((tr) => {
        const [name, authorText, importer] = [...tr.querySelectorAll("td")].map(
          (v) => v.textContent ?? ""
        )

        const author = authorText
          .replace(/\s/g, "")
          .replace(/[，、;]/g, ",")
          .split(",")

        return {
          name,
          author,
          importer: importer.replace(/\s/g, ""),
          status: tableIndex == tableList.length - 1 ? 1 : 0
        }
      })

      list.push(...bookArr)
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
