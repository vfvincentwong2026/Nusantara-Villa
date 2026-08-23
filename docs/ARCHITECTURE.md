# 🏗️ Nusantara-Villa 技术架构文档

**版本**：v1.0.0
**日期**：2026年8月24日
**状态**：设计冻结，可进入开发


## 1. 系统概述

Nusantara-Villa 是一个面向印尼高端别墅市场的 3D 交互配置与实时报价平台。系统采用 **边缘原生（Edge-Native）** 架构，全栈部署在 Cloudflare 生态上，确保印尼本地用户的极速访问体验。

### 1.1 核心设计原则

| 原则 | 说明 |
| :--- | :--- |
| **边缘优先** | 静态资源、API、数据库全部部署在 Cloudflare 边缘网络，全球 300+ 节点加速 |
| **体验驱动** | 3D 交互流畅度是产品生命线，WebGL 渲染和模型加载必须极致优化 |
| **数据闭环** | 用户配置数据 → 报价计算 → 意向提交 → 线索推送，全链路数据打通 |
| **安全合规** | 用户数据最小化采集，符合印尼相关数据保护法规 |


## 2. 系统架构图
┌─────────────────────────────────────────────────────────────────────────┐
│ 用户访问层 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ 桌面浏览器 │ │ 移动浏览器 │ │ WhatsApp │ │
│ │ (Chrome) │ │ (Safari) │ │ (线索推送) │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────┬───────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Cloudflare Pages (前端托管) │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Next.js 14 (App Router) + TypeScript │ │
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │ │
│ │ │ 3D 配置器 │ │ BOQ 报价引擎 │ │ ROI 计算器 │ │ │
│ │ │ (R3F + Drei) │ │ (Zustand) │ │ (实时测算) │ │ │
│ │ └──────────────┘ └──────────────┘ └──────────────┘ │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬───────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Cloudflare Workers (边缘 API) │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ API 路由层 │ │
│ │ POST /api/quote → 生成报价方案 │ │
│ │ POST /api/proposal → 生成 PDF 方案书 │ │
│ │ POST /api/lead → 提交意向线索 │ │
│ │ GET /api/projects → 获取历史项目 │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬───────────────────────────────────────┘
│
┌───────────────────────┼───────────────────────┐
▼ ▼ ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────────┐
│ Cloudflare D1 │ │ Cloudflare R2 │ │ 外部服务集成 │
│ (SQLite) │ │ (对象存储) │ │ ┌───────────────────────┐ │
│ - 意向表单 │ │ - 3D 模型文件 │ │ │ Telegram Bot API │ │
│ - 项目配置 │ │ - PDF 方案书 │ │ │ WhatsApp Business API│ │
│ - 用户会话 │ │ - 图片资源 │ │ │ Resend (邮件) │ │
└─────────────────┘ └─────────────────┘ │ └───────────────────────┘ │
└─────────────────────────────┘

text


## 3. 技术选型详解

### 3.1 前端层

| 组件 | 选型 | 选型理由 |
| :--- | :--- | :--- |
| **框架** | Next.js 14 (App Router) | 服务端渲染 + 静态导出双模式，SEO 友好，印尼本地 CDN 加速 |
| **3D 引擎** | React Three Fiber + Drei | React 生态最成熟的 3D 库，声明式 API，社区活跃 |
| **状态管理** | Zustand | 轻量、简单，适合 3D 配置器的复杂状态管理 |
| **UI 组件** | shadcn/ui + Tailwind CSS | 美观、可定制、组件丰富，开发效率高 |
| **PDF 生成** | @react-pdf/renderer | 客户端渲染 PDF，无需服务端负担 |
| **类型安全** | TypeScript | 全栈类型安全，减少运行时错误 |

### 3.2 后端与部署层

| 组件 | 选型 | 选型理由 |
| :--- | :--- | :--- |
| **托管** | Cloudflare Pages | 全球 CDN 加速，印尼节点覆盖，免费额度充足 |
| **API** | Cloudflare Workers | 边缘计算，毫秒级响应，与 Pages 无缝集成 |
| **数据库** | Cloudflare D1 (SQLite) | 边缘数据库，低延迟，5GB 免费额度 |
| **文件存储** | Cloudflare R2 | S3 兼容，零出口费用，适合 3D 模型和 PDF 存储 |
| **消息推送** | Telegram Bot API | 实时、免费、稳定，适合团队内部通知 |
| **邮件** | Resend | 开发者友好，API 简洁，送达率高 |


## 4. 数据模型

### 4.1 D1 核心表结构

```sql
-- 意向表单表
CREATE TABLE leads (
    id TEXT PRIMARY KEY DEFAULT (uuid4()),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    project_type TEXT,           -- villa | residence | commercial
    style TEXT,                  -- modern_tropical | wabi_sabi | mediterranean
    area_sqm INTEGER,            -- 150 | 200 | 300
    tier TEXT,                   -- standard | luxury | ultra_luxury
    addons TEXT,                 -- JSON 数组: ['pool', 'rooftop', 'spa', 'smart_home']
    estimated_budget REAL,
    status TEXT DEFAULT 'new',   -- new | contacted | converted | lost
    source TEXT DEFAULT 'website',
    created_at INTEGER DEFAULT (unixepoch())
);

-- 项目配置表（用于 3D 预设方案）
CREATE TABLE project_templates (
    id TEXT PRIMARY KEY DEFAULT (uuid4()),
    name TEXT NOT NULL,
    style TEXT NOT NULL,
    area_sqm INTEGER NOT NULL,
    tier TEXT NOT NULL,
    config JSON NOT NULL,        -- 3D 场景配置
    base_price REAL NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch())
);

-- 追加配置表（增值模块定价）
CREATE TABLE addons (
    id TEXT PRIMARY KEY DEFAULT (uuid4()),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,   -- 'pool', 'rooftop', 'spa', 'smart_home'
    description TEXT,
    price_per_sqm REAL,
    price_fixed REAL,
    created_at INTEGER DEFAULT (unixepoch())
);
5. 核心流程
5.1 用户完整旅程
text
1. 访问网站 → 浏览 3D 别墅展示
2. 选择风格 (Modern Tropical / Wabi-Sabi / Mediterranean)
3. 调整面积 (150㎡ / 200㎡ / 300㎡)
4. 选择档次 (Standard / Luxury / Ultra-Luxury)
5. 勾选增值模块 (泳池 / 屋顶露台 / SPA / 智能家居)
6. 实时查看 BOQ 报价更新
7. 查看 ROI 投资回报测算
8. 一键生成 PDF 方案书
9. 填写联系方式 → 提交意向
10. 系统毫秒级推送至 Telegram / WhatsApp
11. 销售团队即时跟进
5.2 报价计算逻辑
text
总价 = 基础价(面积 × 档次系数) + Σ(增值模块价格) + 施工管理费(10%)
档次	系数	说明
Standard	1.0	标准精装，本地材料为主
Luxury	1.6	高端精装，进口材料占比 40%
Ultra-Luxury	2.4	顶级精装，进口材料占比 70%+
6. 性能优化策略
优化点	策略	目标
3D 模型加载	GLTF 压缩 + LOD 分级加载 + 懒加载	首屏加载 < 3s
静态资源	Cloudflare CDN + 边缘缓存	全球平均延迟 < 100ms
API 响应	Workers 边缘计算 + D1 缓存	P95 延迟 < 200ms
PDF 生成	客户端渲染，不占用服务端资源	生成时间 < 2s
图片优化	Next.js Image 组件 + WebP 格式	自动适配设备分辨率
7. 安全与合规
维度	措施
传输安全	全站 HTTPS (Cloudflare 原生)
数据加密	D1 数据库静态加密
密钥管理	Cloudflare Secrets 存储敏感信息
输入验证	服务端 + 客户端双重校验
防滥用	API 速率限制 + Turnstile 验证码
隐私合规	最小化数据采集，提供数据导出/删除接口
8. 监控与可观测性
维度	工具	说明
日志	Cloudflare Workers Logs	请求日志与错误追踪
性能	Cloudflare Analytics	边缘性能监控
错误	Sentry (可选)	前端异常捕获
业务	自定义埋点	转化漏斗分析
文档结束
