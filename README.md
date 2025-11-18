# 小程序版抖音 - Taro 3 学习项目

一个基于 Taro 3 + 原生微信小程序混合开发的短视频应用学习项目，模拟企业级项目架构。

## 项目特点

- **混合开发**：Taro 3 页面与原生小程序页面共存
- **多分包架构**：主包 + 4 个分包（2 Taro + 2 原生）
- **完整 Mock API**：无需后端即可运行
- **TypeScript**：全面类型支持
- **Zustand**：轻量级状态管理

## 技术栈

- **框架**：Taro 3.6.x + React 18
- **语言**：TypeScript 5
- **构建**：Webpack 5
- **状态管理**：Zustand
- **样式**：SCSS + CSS Modules

## 项目结构

```
├── config/                    # Taro 配置
├── docs/                      # 项目文档
│   ├── ARCHITECTURE.md       # 架构设计
│   └── API.md                # API 文档
├── src/
│   ├── pages/                # 主包 Taro 页面
│   ├── packageVideo/         # Taro 分包 - 视频模块
│   ├── packageSearch/        # Taro 分包 - 搜索模块
│   ├── native/               # 原生小程序页面
│   │   ├── pages/           # 原生主包页面
│   │   ├── packagePublish/  # 原生分包 - 发布模块
│   │   └── packageMessage/  # 原生分包 - 消息模块
│   ├── components/           # 公共组件
│   ├── stores/               # Zustand 状态管理
│   ├── services/             # API 服务层
│   ├── mock/                 # Mock 数据
│   ├── types/                # TypeScript 类型
│   ├── utils/                # 工具函数
│   ├── constants/            # 常量定义
│   ├── hooks/                # 自定义 Hooks
│   └── assets/               # 静态资源
└── package.json
```

## 包结构

### 主包
- `pages/index` - 首页（Taro）
- `pages/profile` - 个人中心（Taro）
- `pages/login` - 登录页（原生）

### Taro 分包
- `packageVideo` - 视频流、详情、评论、用户主页
- `packageSearch` - 搜索首页、结果、话题

### 原生分包
- `packagePublish` - 视频选择、编辑、发布
- `packageMessage` - 消息中心、通知列表

## 环境要求

- **Node.js**: >= 16.0.0 (推荐 18.x LTS)
- **npm**: >= 8.0.0
- **微信开发者工具**: 最新稳定版

## 快速开始

### 安装依赖

```bash
# 检查 Node 版本
node -v

npm install
# 或
yarn
```

### 开发模式

```bash
# 微信小程序
npm run dev:weapp

# H5
npm run dev:h5
```

### 生产构建

```bash
npm run build:weapp
```

### 预览

1. 打开微信开发者工具
2. 导入项目，选择 `dist/weapp` 目录
3. 使用测试 AppID 或自己的 AppID

## Mock API

项目内置完整的 Mock API 层，覆盖以下模块：

- 视频：列表、详情、点赞、收藏、发布
- 用户：登录、信息、关注、粉丝
- 评论：列表、发布、点赞
- 搜索：搜索、热搜、历史
- 消息：通知中心、消息列表

详细 API 文档见 [docs/API.md](./docs/API.md)

## 核心功能

- [x] 首页推荐/关注视频流
- [x] 上下滑动切换视频
- [x] 视频点赞、收藏、分享
- [x] 用户个人中心
- [x] 视频发布流程
- [x] 消息通知中心
- [x] 搜索功能框架

## 架构设计

详细架构设计见 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 后续扩展

- [ ] 接入真实后端 API
- [ ] 视频云存储上传
- [ ] 推荐算法埋点
- [ ] AI 智能文案生成
- [ ] 性能监控与优化

## 开发规范

- 组件使用 PascalCase 命名
- 文件使用 camelCase 命名
- 常量使用 UPPER_SNAKE_CASE
- 类型定义集中在 `types/` 目录

## License

MIT
