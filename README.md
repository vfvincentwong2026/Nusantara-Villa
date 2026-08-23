# Nusantara-Villa
“以数字技术重塑印尼豪宅建设：可视化你的梦幻别墅，实时演算透明造价，一站式安心交付。”
# 🏛️ Nusantara Villa 3D Configurator & Turnkey BOQ Estimator

> **面向印尼（巴厘岛/雅加达/龙目岛/新首都）高端别墅市场的 3D 交互配置、实时造价（BOQ）测算与一站式整装交付（Design-Build & Turnkey）数字平台。**

[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2014-black?logo=next.js)](https://nextjs.org/)
[![3D Engine](https://img.shields.io/badge/3D%20Engine-React%20Three%20Fiber-blue?logo=three.js)](https://docs.pmnd.rs/react-three-fiber/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 项目背景与定位 (Overview)

海外投资者与高净值业主在印尼进行别墅投资建设时，常面临**信息不对称、跨国沟通成本高、恶意加价以及施工质量难以监控**等痛点。

**Nusantara Villa** 采用“保时捷配置器”式的轻量级 Web 3D 交互，将复杂的 CAD/3D 建模转化为简单直观的在线选配工具。结合本土施工成本算法，实现**“所见即所得、预算透明可控、秒级获客线索拦截”**，打造高信任度、高转化率的数字化高端建筑交付通道。

---

## 🌟 核心功能 (Key Features)

* **🎨 3D 交互选配 (Interactive 3D Configurator)**
  * 基于 WebGL / React Three Fiber 的高质感热带别墅场景渲染。
  * 支持 Modern Tropical（现代热带风）、Wabi-Sabi（侘寂风）、Mediterranean（地中海风）等主流风格及材质实时切换。
* **💰 动态 BOQ 与预算引擎 (Live BOQ Estimator)**
  * 根据建筑面积（㎡）、选配档次（Standard / Luxury / Ultra-Luxury）实时演算施工与硬装软装造价。
  * 内置印尼本土增值选配模块：无边泳池（Infinity Pool）、屋顶露台（Rooftop Deck）、SPA 亭（Yoga Shala）、全屋智能与太阳能系统。
* **📊 投资回报率算力模型 (Rental Yield & ROI Calculator)**
  * 针对巴厘岛/龙目岛外籍投资者，根据项目预估总造价与当地租金大数据，实时测算日租金收益与年化投资回报率（ROI）。
* **📄 自动化 PDF 方案书生成 (Instant PDF Proposals)**
  * 选配完成后，前端一键渲染包含初步材料清单（BOQ）、工程阶段规划与免责声明的精美 PDF 方案书。
* **📱 毫秒级线索拦截与推送 (High-Conversion Lead Capture)**
  * 无缝集成 Telegram Bot API & WhatsApp Business API，当客户提交意向时，毫秒级将客户选配数据与联系方式推送至项目经理手机。

---

## 🏗️ 技术架构 (Tech Stack)

```text
[ 前端展示与交互层 (Frontend) ]
  ├── Next.js 14 (App Router) + TypeScript
  ├── React Three Fiber (R3F) + Drei (3D 引擎)
  ├── TailwindCSS + Zustand (状态管理与报价计算)
  └── @react-pdf/renderer (客户端动态 PDF 导出)

[ 边缘服务与全栈部署 (Serverless & Cloudflare) ]
  ├── Cloudflare Pages (静态资源与 WebGL 3D 模型全球 CDN 加速)
  ├── Cloudflare Workers (边缘 API 逻辑处理与线索转发)
  └── Cloudflare D1 (轻量级 SQLite 数据库，用于意向表单存储)

[ 通讯与通知 (Integrations) ]
  ├── Telegram Bot API (团队实时接单提醒)
  ├── WhatsApp Business API (印尼本地客户即时沟通)
  └── Resend / SendGrid (自动化邮件通知)

快速开始 (Quick Start)
环境准备 (Prerequisites)
Node.js >= 18.17.0

npm / pnpm / yarn

本地开发 (Local Setup)
克隆代码仓库
git clone [https://github.com/your-username/nusantara-villa.git](https://github.com/your-username/nusantara-villa.git)
cd nusantara-villa

安装依赖
npm install

配置环境变量
在项目根目录下创建 .env.local 文件：
NEXT_PUBLIC_SITE_URL=http://localhost:3000
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
NEXT_PUBLIC_WHATSAPP_NUMBER=6281234567890

启动开发服务器
npm run dev

打开浏览器访问 http://localhost:3000 即可查看效果。☁️ Cloudflare 部署指南 (Deployment)本项目针对 Cloudflare Pages 进行了深度优化，可实现低成本、极速部署：将代码推送到你的 GitHub 仓库。登录 Cloudflare Dashboard $\rightarrow$ Workers & Pages $\rightarrow$ Create Application $\rightarrow$ Pages $\rightarrow$ Connect to Git。选择 nusantara-villa 仓库，构建设置如下：Framework preset: Next.jsBuild command: npx @cloudflare/next-on-pagesBuild output directory: .vercel/output/static在 Cloudflare Pages 后台环境变量（Environment Variables）中添加你的 Telegram Bot Token 和 WhatsApp 接收号码。点击 Save and Deploy，即可完成全球 CDN 部署。🗺️ 产品迭代路线图 (Roadmap)[x] Phase 1: MVP 验证 — WebGL 3D 模型渲染 + 基础参数造价计算器 + Cloudflare Pages 部署。[ ] Phase 2: 交互与线索拦截 — 支持多区域材质实时替换、动态 PDF 方案书生成、Telegram/WhatsApp 秒级线索推送。[ ] Phase 3: 印尼本土化 — 支持英语/印尼语/中文多语言切换、集成印尼建筑合规许可（PBG/SLF）咨询模块。[ ] Phase 4: 数字化交付看板 — 增加 "Live Construction Monitor"（远程施工进度与日志看板），打造“线上选配 ➔ 合同签订 ➔ 远程监工 ➔ 整装交付”的全流程闭环。📄 开源协议 (License)本项目采用 MIT License 开源协议。
