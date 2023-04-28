import fs from "fs"
import path from "path"
import { parse } from "node-html-parser"

const html = fs.readFileSync(
  path.resolve(process.cwd(), "html/2023.4引进漫画整理.html"),
  "utf-8"
)
const root = parse(html)
const tableList = root.querySelectorAll("table")

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

const booksList = tableList.reduce<Book[]>(
  (list, table, tableIndex, tableList) => {
    const [, ...trArr] = table.querySelectorAll("tr")
    const bookArr = trArr.map<Book>((tr) => {
      const [name, authorText, importer] = tr
        .querySelectorAll("td")
        .map((v) => v.textContent)

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
const books = Object.values(groupBy(booksList, "importer")).flat()
// console.log(Object.values(books).flat())

const importers = [...new Set(books.map((v) => v.importer))].filter((v) => v)
const outputPath = path.resolve(process.cwd(), "src/assets/books.json")

fs.writeFile(
  outputPath,
  JSON.stringify({ importers, books }, null, 4),
  () => {}
)

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
