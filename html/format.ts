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
  "https://mp.weixin.qq.com/s/U6pdDFme4BXH8xUzUf2ytA",
  "https://mp.weixin.qq.com/s/V6PcLZnwDsdHUGOffZZboQ",
  "https://mp.weixin.qq.com/s/Mcu41rUt2S8c3ZDCsWzc_A"
  // "https://mp.weixin.qq.com/s/Cel2RBgyQgegR2EQuGlHRw"
]

const browser = await puppeteer.launch({ headless: "new" })

const booksList = (
  await Promise.all(
    urls.map(async (url) => {
      const page = await browser.newPage()

      page.on("console", (message) => {
        const text = message.text()

        console.log(text)
      })

      await page.goto(url)
      const booksList = await page.evaluate(getBooks)
      return booksList
    })
  )
).flat()

const booksGroup = groupBy(uniqBy([...booksList].reverse(), "name"), "importer")

const books = Object.entries(booksGroup)
  .map(([, val]) => val.sort((a, b) => b.status - a.status))
  .flat()

const importers = [...new Set(Object.keys(booksGroup))].filter((v) => v)
const outputPath = "src/assets/books.json"

await Bun.write(outputPath, JSON.stringify({ importers, books }, null, 4))
browser.close()

/**
 * 收集书籍信息
 */
async function getBooks() {
  const reversed = ["小津麻理子"]
  const wronged = ["与妖为邻"]
  const tableList = [...document.querySelectorAll("table")]

  // 是否出版由标题决定
  let hasPublishedTable: undefined | boolean

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

        let status: Book["status"] = 0

        if (hasPublishedTable == undefined) {
          hasPublishedTable =
            table.previousElementSibling?.textContent?.includes("已出版") ||
            undefined
        }

        if (hasPublishedTable) {
          status = 1
        }

        if (!hasPublishedTable && tableIndex == tableList.length - 1) {
          status = 1
        }

        const text = table.previousElementSibling?.textContent || ""
        const isMatched = text.includes("已出版")

        const obj = {
          hasPublishedTable,
          status
        }

        if (isMatched) {
          Object.assign(obj, { text })
        }

        if (name !== "作品") {
          Object.assign(obj, { name })

          console.log("✅", JSON.stringify(obj))
        }

        if (name !== "作品") {
          list.push({
            name,
            author,
            importer,
            status
          })
        }
      })

      return list
    },
    []
  )

  console.log(
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
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
  return array.filter((item, index, self) => {
    const val = item[byKey] as any
    if (seen.hasOwnProperty(val)) {
      return false
    }
    seen[val] = true

    const sameStart = self.find(
      (v) => v.name.startsWith(item.name) || item.name.startsWith(v.name)
    )
    if (sameStart) {
      return self.indexOf(sameStart) === index
    }

    return true
  })
}
