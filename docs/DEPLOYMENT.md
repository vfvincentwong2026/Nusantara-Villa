# 🚀 Nusantara-Villa 部署与运维指南

**版本**：v1.0.0


## 1. 部署架构概览

Nusantara-Villa 全栈部署在 Cloudflare 生态上，架构如下：
┌─────────────────────────────────────────────────────────────┐
│ Cloudflare Pages ← 前端 (Next.js) │
│ + Cloudflare Workers ← 后端 API │
│ + Cloudflare D1 ← 数据库 │
│ + Cloudflare R2 ← 文件存储 │
└─────────────────────────────────────────────────────────────┘

text


## 2. 前置条件

| 资源 | 说明 | 获取方式 |
| :--- | :--- | :--- |
| Cloudflare 账号 | 免费 | [cloudflare.com](https://cloudflare.com) |
| 域名（可选） | 自定义域名 | 域名注册商 |
| Telegram Bot Token | 消息推送 | 通过 @BotFather 创建 |
| Resend API Key | 邮件发送 | [resend.com](https://resend.com) |


## 3. 部署步骤

### 3.1 克隆与本地开发

```bash
git clone https://github.com/vfvincentwong2026/Nusantara-Villa.git
cd Nusantara-Villa
npm install
cp .env.example .env.local
# 填入环境变量
npm run dev
3.2 配置环境变量
创建 .env.local 文件：

env
# Cloudflare
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your_account_id

# API
NEXT_PUBLIC_API_BASE_URL=https://api.nusantara-villa.com

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# WhatsApp (可选)
WHATSAPP_API_URL=your_whatsapp_api_url
WHATSAPP_API_TOKEN=your_whatsapp_api_token

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@nusantara-villa.com
3.3 初始化 D1 数据库
bash
# 创建数据库
npx wrangler d1 create nusantara_db

# 执行迁移
npx wrangler d1 execute nusantara_db --file=./migrations/init.sql
3.4 部署 Workers API
bash
# 部署到 Cloudflare Workers
npx wrangler deploy

# 部署到预览环境
npx wrangler deploy --env preview
3.5 部署前端到 Pages
bash
# 构建生产版本
npm run build

# 部署到 Pages
npx wrangler pages deploy ./out
4. CI/CD 自动化
使用 GitHub Actions 自动部署：

yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npm run build
      - run: npx wrangler pages deploy ./out --project-name=nusantara-villa
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
5. 环境划分
环境	URL	用途
开发	http://localhost:3000	本地开发调试
预览	https://nusantara-villa.pages.dev	PR 自动部署
生产	https://nusantara-villa.com	正式环境
6. 监控与告警
监控项	工具	告警阈值
API 响应时间	Cloudflare Analytics	> 500ms
页面加载时间	Cloudflare Analytics	> 3s
错误率	Workers Logs	> 1%
数据库连接	D1 Metrics	连接池满
7. 回滚策略
bash
# 查看部署历史
npx wrangler pages deployment list

# 回滚到指定版本
npx wrangler pages deployment rollback <deployment_id>
文档结束
