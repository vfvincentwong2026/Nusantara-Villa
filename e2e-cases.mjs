// Nusantara Villa - 案例中心端到端实测（Playwright raw 库）
// 流程: 首页标杆作品 → 案例列表 → 风格筛选 → 详情 → 灯箱 → CTA → 配置器 URL 预设
import { chromium } from 'playwright'
import fs from 'node:fs'

const SHOT_DIR = '../screenshots'
fs.mkdirSync(SHOT_DIR, { recursive: true })

const consoleErrors = []
const pageErrors = []
const failedRequests = []

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => pageErrors.push(String(err)))
page.on('requestfailed', (req) => {
  failedRequests.push(`${req.url()} :: ${req.failure()?.errorText}`)
})

const step = async (name, fn) => {
  try {
    await fn()
    console.log(`✅ ${name}`)
    return true
  } catch (e) {
    console.log(`❌ ${name}: ${e.message.split('\n')[0]}`)
    return false
  }
}

// ---------- 首页 ----------
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 })

await step('首页「标杆作品」区块可见 + 3 张案例卡', async () => {
  await page.waitForSelector('text=标杆作品', { timeout: 20000 })
  const cards = await page.locator('a[href^="/case-studies/"]').count()
  if (cards < 3) throw new Error(`首页案例卡不足: ${cards}`)
})

await step('点击「查看全部案例」→ 进入 /case-studies', async () => {
  await page.click('section >> text=查看全部案例 >> nth=0')
  await page.waitForURL('**/case-studies**', { timeout: 15000 })
})

// ---------- 案例列表 ----------
let totalCards = 0
await step('列表页渲染 ≥20 张卡片', async () => {
  await page.waitForSelector('text=精选案例', { timeout: 15000 })
  await page.waitForSelector('a[href^="/case-studies/"]', { timeout: 15000 })
  totalCards = await page.locator('a[href^="/case-studies/"]').count()
  console.log(`   全部案例卡片数: ${totalCards}`)
  if (totalCards < 20) throw new Error(`卡片数不足: ${totalCards}`)
  await page.screenshot({ path: `${SHOT_DIR}/cases-01-list.png` })
})

let filteredCards = 0
await step('风格筛选 wabi_sabi → 卡片变少', async () => {
  await page.click('button:has-text("侘寂风")')
  await page.waitForURL('**style=wabi_sabi**', { timeout: 10000 })
  await page.waitForTimeout(800)
  filteredCards = await page.locator('a[href^="/case-studies/"]').count()
  console.log(`   侘寂风卡片数: ${filteredCards}`)
  if (filteredCards === 0 || filteredCards >= totalCards) {
    throw new Error(`筛选结果异常: ${filteredCards} / ${totalCards}`)
  }
  await page.screenshot({ path: `${SHOT_DIR}/cases-02-filtered.png` })
})

// ---------- 案例详情 ----------
await step('点击第一张卡 → 详情页英雄图/亮点/画廊存在', async () => {
  await page.locator('a[href^="/case-studies/"]').first().click()
  await page.waitForSelector('text=项目描述', { timeout: 15000 })
  await page.waitForSelector('text=设计亮点')
  await page.waitForSelector('text=实景图集')
  const heroImgs = await page.locator('section img').count()
  if (heroImgs === 0) throw new Error('英雄区无图片')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${SHOT_DIR}/cases-03-detail.png` })
})

await step('点击画廊图 → 灯箱弹出 → ESC 关闭', async () => {
  await page.locator('button[aria-label^="查看大图"]').first().click()
  await page.waitForSelector('div[role="dialog"]', { timeout: 5000 })
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOT_DIR}/cases-04-lightbox.png` })
  await page.keyboard.press('Escape')
  await page.waitForSelector('div[role="dialog"]', { state: 'detached', timeout: 5000 })
})

// ---------- CTA → 配置器预设 ----------
await step('点击「定制同款别墅」CTA → /configurator 含 style/area 参数', async () => {
  await page.click('a:has-text("定制同款别墅")')
  await page.waitForURL('**/configurator**', { timeout: 15000 })
  const url = page.url()
  console.log(`   跳转 URL: ${url}`)
  if (!url.includes('style=') || !url.includes('area=')) {
    throw new Error(`URL 缺少预设参数: ${url}`)
  }
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${SHOT_DIR}/cases-05-configurator-preset.png` })
})

await step('Zustand persist localStorage 中 style/size 已预设', async () => {
  const raw = await page.evaluate(() =>
    window.localStorage.getItem('nusantara-configurator-storage')
  )
  if (!raw) throw new Error('localStorage 中无 persist 数据')
  const parsed = JSON.parse(raw)
  console.log(`   persist 状态: style=${parsed.state?.style}, size=${parsed.state?.size}`)
  if (!parsed.state?.style) throw new Error('style 未被预设')
  if (![150, 200, 300].includes(parsed.state?.size)) {
    throw new Error(`size 预设异常: ${parsed.state?.size}`)
  }
})

// ---------- 汇总 ----------
console.log('\n========== 运行时健康检查 ==========')
console.log(`Console 错误: ${consoleErrors.length ? JSON.stringify(consoleErrors.slice(0, 5), null, 1) : '无'}`)
console.log(`页面异常: ${pageErrors.length ? JSON.stringify(pageErrors.slice(0, 5), null, 1) : '无'}`)
console.log(`失败请求: ${failedRequests.length ? JSON.stringify(failedRequests.slice(0, 5), null, 1) : '无'}`)

await browser.close()
