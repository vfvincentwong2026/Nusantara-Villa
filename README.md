# 🏡 Nusantara Villa

> **印尼高端别墅「3D 交互配置 + 实时报价 + 一站式整装交付」平台。**
>
> 让海外投资者在线选择别墅风格、实时测算造价、一键生成方案书，3 分钟完成从“想法”到“意向”的转化。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://developers.cloudflare.com/workers/)
[![Status: v1.0](https://img.shields.io/badge/Status-v1.0-green.svg)]()


## 这个平台解决什么问题？

海外投资者在印尼建别墅，面临四大痛点：

| 痛点 | 传统方式 | Nusantara Villa 的做法 |
| :--- | :--- | :--- |
| **无法线上看房** | 必须飞印尼实地考察 | **3D 交互配置器**，在线漫游别墅空间 |
| **价格不透明** | 多次询价、反复沟通 | **实时 BOQ 造价引擎**，选配即报价 |
| **投资回报看不清** | 靠中介口头承诺 | **ROI 测算器**，结合租金大数据自动计算 |
| **沟通效率低** | 微信/邮件反复拉扯 | **一键生成 PDF 方案书**，自动发送给客户 |

**一句话：把“别墅装修”做成像“买手机”一样简单——选配置、看价格、提交意向，3 分钟完成。**


## 🎯 核心功能

| 功能模块 | 说明 |
| :--- | :--- |
| **🎨 3D 交互配置器** | 选择别墅风格（现代热带 / 侘寂风 / 轻奢），实时切换材质、配色、家具 |
| **💰 实时 BOQ 与预算引擎** | 根据面积（150/200/300㎡）+ 档次（标准/豪华/超豪华）自动生成施工与装修造价 |
| **📊 ROI 投资回报测算** | 结合当地租金大数据，自动计算日租金收益和年化投资回报率 |
| **📄 一键生成 PDF 方案书** | 包含 3D 效果图、材料清单、工程规划、造价明细 |
| **⚡ 毫秒级线索推送** | 客户提交意向 → Telegram/WhatsApp 实时推送至项目经理手机 |
| **☁️ 边缘部署** | Cloudflare Pages + Workers + D1，印尼本地访问极速 |


## 🗺️ 路由

| 路由 | 页面 | 说明 |
| :--- | :--- | :--- |
| `/` | 首页 | 项目介绍 + 快速入口 |
| `/configurator` | 配置器 | 3D 别墅配置 + BOQ 报价 + 线索提交 |
| `/api/lead` | API | 线索提交接口 (Edge Runtime) |


## 🛠️ 技术选型

| 层级 | 技术 |
| :--- | :--- |
| **前端框架** | Next.js 14 (App Router) + TypeScript |
| **3D 引擎** | React Three Fiber + Three.js |
| **UI 组件** | shadcn/ui + Tailwind CSS |
| **后端 API** | Cloudflare Workers (Edge Runtime) |
| **数据库** | Cloudflare D1 (SQLite) |
| **文件存储** | Cloudflare R2 (PDF 方案书) |
| **消息推送** | Telegram Bot API / WhatsApp Business API |
| **状态管理** | Zustand (带 persist) |


## 📂 项目结构
Nusantara-Villa/
├── app/
│ ├── api/
│ │ └── lead/
│ │ └── route.ts # Edge API: 线索提交
│ ├── configurator/
│ │ └── page.tsx # 配置器主页面 (/configurator)
│ ├── layout.tsx # 根布局
│ └── page.tsx # 首页 (/)
├── components/
│ ├── 3d/
│ │ └── VillaScene.tsx # 3D 场景组件 (R3F)
│ ├── canvas/
│ │ └── VillaCanvas.tsx # VillaScene 别名导出
│ ├── configurator/
│ │ ├── StepContainer.tsx # 步骤容器 (进度条 + 导航)
│ │ ├── SelectionGrid.tsx # 选择网格 (风格/面积/档次/增值)
│ │ ├── QuoteSummary.tsx # 报价汇总 (BOQ + ROI)
│ │ └── LeadForm.tsx # 线索提交表单
│ └── ui/
│ └── CurrencyToggle.tsx # USD/IDR 货币切换
├── store/
│ └── useConfiguratorStore.ts # Zustand 状态管理 + 算价引擎
├── lib/
│ ├── utils.ts # 通用工具函数
│ └── telegram.ts # Telegram 通知服务 (Edge 兼容)
├── docs/
│ ├── ARCHITECTURE.md # 技术架构文档
│ ├── API_REFERENCE.md # API 参考文档
│ └── FRONTEND_PAGES.md # 前端页面设计
├── .env.example # 环境变量示例
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md

text


## 🚀 快速开始

### 前置条件
- Node.js 18+
- Cloudflare 账号（免费）
- Telegram Bot Token（用于线索推送）

### 安装与运行

```bash
# 1. 克隆
git clone https://github.com/vfvincentwong2026/Nusantara-Villa.git
cd Nusantara-Villa

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 填入 TELEGRAM_BOT_TOKEN 和 TELEGRAM_CHAT_ID

# 4. 启动开发服务器
npm run dev

# 5. 打开浏览器
# 首页: http://localhost:3000
# 配置器: http://localhost:3000/configurator
部署到 Cloudflare
bash
npm run build
npx wrangler pages deploy ./out --project-name=nusantara-villa
🔗 相关项目
项目	定位	关系
Nusantara Villa（本项目）	C端转化平台	3D 体验 → 实时报价 → 意向转化
IndoScout-D-B	B端获客引擎	主动挖掘客户 → 销售跟进
📄 许可证
MIT License

