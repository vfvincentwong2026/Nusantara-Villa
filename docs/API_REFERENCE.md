# 📡 Nusantara-Villa API 参考文档

**版本**：v1.0.0
**基础 URL**：`https://api.nusantara-villa.com`


## 1. 通用规范

### 1.1 认证

大部分 API 为公开接口，无需认证。管理类接口使用 Cloudflare Workers 的 API Key 认证。

```http
Authorization: Bearer <API_KEY>
1.2 响应格式
所有 API 响应统一为 JSON 格式：

json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "timestamp": 1724400000
}
1.3 错误码
状态码	说明
200	成功
400	请求参数错误
401	未认证
403	无权限
404	资源不存在
429	请求过于频繁
500	服务器内部错误
2. 报价相关 API
2.1 生成报价
POST /api/quote

请求体：

json
{
  "style": "modern_tropical",
  "area_sqm": 200,
  "tier": "luxury",
  "addons": ["pool", "rooftop"]
}
参数说明：

参数	类型	必填	可选值
style	string	✅	modern_tropical, wabi_sabi, mediterranean
area_sqm	integer	✅	150, 200, 300
tier	string	✅	standard, luxury, ultra_luxury
addons	array	❌	pool, rooftop, spa, smart_home
响应示例：

json
{
  "success": true,
  "data": {
    "base_price": 850000,
    "addons_price": 120000,
    "management_fee": 97000,
    "total_price": 1067000,
    "currency": "USD",
    "breakdown": {
      "structure": 350000,
      "finishing": 300000,
      "furniture": 200000,
      "addons": {
        "pool": 80000,
        "rooftop": 40000
      },
      "management": 97000
    },
    "estimated_completion_months": 10
  }
}
2.2 计算 ROI
POST /api/roi

请求体：

json
{
  "total_price": 1067000,
  "location": "bali",
  "property_type": "villa"
}
响应示例：

json
{
  "success": true,
  "data": {
    "estimated_daily_rent": 350,
    "estimated_monthly_rent": 10500,
    "estimated_yearly_rent": 126000,
    "gross_yield": 11.8,
    "net_yield": 8.9,
    "payback_years": 8.5,
    "currency": "USD"
  }
}
3. 方案书 API
3.1 生成 PDF 方案书
POST /api/proposal

请求体：

json
{
  "client_name": "John Doe",
  "email": "john@example.com",
  "phone": "+62 812-3456-7890",
  "project_name": "Villa Canggu",
  "style": "modern_tropical",
  "area_sqm": 200,
  "tier": "luxury",
  "addons": ["pool", "rooftop"],
  "total_price": 1067000
}
响应示例：

json
{
  "success": true,
  "data": {
    "proposal_id": "prop_20260824_001",
    "pdf_url": "https://r2.cloudflare.com/proposals/prop_20260824_001.pdf",
    "expires_at": 1724400000
  }
}
4. 线索提交 API
4.1 提交意向
POST /api/lead

请求体：

json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+62 812-3456-7890",
  "project_type": "villa",
  "style": "modern_tropical",
  "area_sqm": 200,
  "tier": "luxury",
  "addons": ["pool", "rooftop"],
  "estimated_budget": 1067000,
  "message": "计划 2026 年底启动，希望了解更多细节"
}
响应示例：

json
{
  "success": true,
  "data": {
    "lead_id": "lead_20260824_001",
    "status": "received",
    "notified": true,
    "created_at": 1724400000
  }
}
5. 管理类 API
5.1 获取项目模板列表
GET /api/templates

响应示例：

json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "tmpl_001",
        "name": "Modern Tropical 200㎡ Luxury",
        "style": "modern_tropical",
        "area_sqm": 200,
        "tier": "luxury",
        "base_price": 850000,
        "preview_image": "https://cdn.nusantara-villa.com/templates/tmpl_001.jpg"
      }
    ]
  }
}
5.2 获取增值模块列表
GET /api/addons

响应示例：

json
{
  "success": true,
  "data": {
    "addons": [
      {
        "code": "pool",
        "name": "Infinity Pool",
        "description": "无边泳池，含过滤系统",
        "price_per_sqm": 400,
        "price_fixed": null
      }
    ]
  }
}
文档结束
