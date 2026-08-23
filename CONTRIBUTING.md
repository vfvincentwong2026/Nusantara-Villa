# 🤝 贡献指南

感谢你对 Nusantara-Villa 项目的关注！


## 1. 行为准则

本项目遵循 [Contributor Covenant](https://www.contributor-covenant.org/) 行为准则。请确保在参与项目时保持友善、尊重和专业的交流。


## 2. 如何贡献

### 2.1 报告 Bug

1. 检查 [Issues](https://github.com/vfvincentwong2026/Nusantara-Villa/issues) 是否已存在相同问题
2. 创建新 Issue，使用 `Bug Report` 模板
3. 清晰描述复现步骤、预期结果和实际结果
4. 附上截图或错误日志（如有）

### 2.2 提交代码

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature-name`
3. 提交代码：`git commit -m 'feat: add some feature'`
4. 推送到分支：`git push origin feature/your-feature-name`
5. 开启 Pull Request

### 2.3 Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

| 类型 | 说明 |
| :--- | :--- |
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式调整 |
| `refactor` | 代码重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具配置 |


## 3. 开发流程

### 3.1 本地开发

```bash
git clone https://github.com/your-username/Nusantara-Villa.git
cd Nusantara-Villa
npm install
cp .env.example .env.local
npm run dev
3.2 代码检查
bash
# TypeScript 类型检查
npm run type-check

# ESLint 检查
npm run lint

# 格式化代码
npm run format
4. 测试
bash
# 运行单元测试
npm run test

# 运行 E2E 测试
npm run test:e2e
5. Pull Request 要求
□ 代码通过 TypeScript 类型检查
□ 代码通过 ESLint 检查
□ 新增功能包含对应测试
□ 更新相关文档
□ PR 描述清晰说明改动内容和原因
感谢你的贡献！
