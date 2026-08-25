// Nusantara Villa - /configurator 8 步流程端到端实测（Playwright）
import { chromium } from 'playwright'
import fs from 'node:fs'

const SHOT_DIR = '../screenshots'
fs.mkdirSync(SHOT_DIR, { recursive: true })

const consoleErrors = []
const pageErrors = []
const failedRequests = []
let interceptedWaUrl = null

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => pageErrors.push(String(err)))
page.on('requestfailed', (req) => {
  if (!req.url().includes('wa.me')) failedRequests.push(`${req.url()} :: ${req.failure()?.errorText}`)
})

// 拦截 wa.me 跳转（提交成功后 location.href 会跳过去）
await page.route('**://wa.me/**', (route) => {
  interceptedWaUrl = route.request().url()
  route.abort()
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

await page.goto('http://localhost:3000/configurator', { waitUntil: 'networkidle', timeout: 60000 })

// ---------- Step 0: 欢迎页 ----------
await step('欢迎页渲染 + 3D Canvas 存在', async () => {
  await page.waitForSelector('text=Start Configuring', { timeout: 20000 })
  await page.waitForSelector('canvas', { timeout: 20000 })
  await page.waitForTimeout(2500) // 等 3D 场景渲染
  await page.screenshot({ path: `${SHOT_DIR}/01-welcome.png` })
})

await step('点击 Start Configuring', async () => {
  await page.click('text=Start Configuring')
  await page.waitForSelector('text=选择建筑风格')
})

// ---------- Step 1: 风格 ----------
await step('选择风格: 现代热带', async () => {
  await page.click('button:has-text("现代热带")')
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${SHOT_DIR}/02-style.png` })
  await page.click('button:has-text("下一步")')
  await page.waitForSelector('text=选择建筑面积')
})

// ---------- Step 2: 面积 ----------
await step('选择面积: 200 m²', async () => {
  await page.click('button:has-text("200 m²")')
  await page.click('button:has-text("下一步")')
  await page.waitForSelector('text=选择装修档次')
})

// ---------- Step 3: 档次 ----------
await step('选择档次: 豪华', async () => {
  await page.click('button:has-text("豪华")')
  await page.click('button:has-text("下一步")')
  await page.waitForSelector('text=增值模块')
})

// ---------- Step 4: 增值模块 ----------
await step('勾选增值模块: 泳池 + 屋顶露台', async () => {
  await page.click('button:has-text("Infinity Pool")')
  await page.click('button:has-text("Rooftop Deck")')
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOT_DIR}/03-addons.png` })
  await page.click('button:has-text("下一步")')
  await page.waitForSelector('text=报价预览')
})

// ---------- Step 5: 报价 ----------
let usdPrice = ''
await step('报价页: 校验总价 = $1,033,560', async () => {
  await page.waitForSelector('text=预估总造价')
  await page.waitForTimeout(500)
  usdPrice = await page.textContent('p.text-3xl')
  console.log(`   页面显示总价: ${usdPrice}`)
  if (!usdPrice.includes('1,033,560')) throw new Error(`总价不符: ${usdPrice}`)
  await page.screenshot({ path: `${SHOT_DIR}/04-quote-usd.png` })
})

await step('货币切换 USD → IDR', async () => {
  await page.click('button:has-text("IDR")')
  await page.waitForTimeout(400)
  const idrPrice = await page.textContent('p.text-3xl')
  console.log(`   IDR 显示: ${idrPrice}`)
  if (!idrPrice.includes('Rp')) throw new Error(`IDR 切换失败: ${idrPrice}`)
  await page.screenshot({ path: `${SHOT_DIR}/05-quote-idr.png` })
  await page.click('button:has-text("下一步")')
  await page.waitForSelector('text=提交意向')
})

// ---------- Step 6: 表单校验 ----------
await step('表单空提交被校验拦截', async () => {
  await page.click('button:has-text("Get Full BOQ")')
  await page.waitForSelector('text=请输入您的姓名')
})

await step('填写表单并提交', async () => {
  await page.fill('#name', 'E2E Tester')
  await page.fill('#email', 'e2e@test.com')
  await page.fill('#phone', '+62 812-0000-1111')
  await page.fill('#message', 'Playwright 自动化实测')
  await page.screenshot({ path: `${SHOT_DIR}/06-form.png` })
  await page.click('button:has-text("Get Full BOQ")')
  await page.waitForSelector('text=Configuration Saved', { timeout: 20000 })
  await page.screenshot({ path: `${SHOT_DIR}/07-complete.png` })
})

await step('提交后触发 wa.me 跳转', async () => {
  await page.waitForTimeout(1500)
  if (!interceptedWaUrl) throw new Error('未捕获到 wa.me 跳转')
  console.log(`   跳转链接: ${interceptedWaUrl.slice(0, 120)}...`)
})

// ---------- 汇总 ----------
console.log('\n========== 运行时健康检查 ==========')
console.log(`Console 错误: ${consoleErrors.length ? JSON.stringify(consoleErrors.slice(0, 5), null, 1) : '无'}`)
console.log(`页面异常: ${pageErrors.length ? JSON.stringify(pageErrors.slice(0, 5), null, 1) : '无'}`)
console.log(`失败请求: ${failedRequests.length ? JSON.stringify(failedRequests.slice(0, 5), null, 1) : '无'}`)

await browser.close()
