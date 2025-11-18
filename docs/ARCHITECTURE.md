# 小程序版抖音 - 项目架构文档

## 一、项目整体说明

### 1.1 项目定位

本项目是一个「小程序版抖音」学习项目，旨在模拟企业级短视频应用的完整架构。项目采用 Taro 3 + 原生微信小程序混合开发模式，覆盖推荐视频流、用户交互、内容发布、消息通知等核心场景。

### 1.2 技术栈

- **框架**：Taro 3.6.x（React 18 + TypeScript 5）
- **构建工具**：Webpack 5（Taro 默认）
- **状态管理**：Zustand
- **样式方案**：SCSS + CSS Modules
- **原生能力**：微信小程序原生页面 + 组件
- **数据模拟**：本地 Mock API 层

### 1.3 核心目标

- 实践 Taro 3 与原生小程序的混合开发模式
- 构建符合大厂规范的多分包架构（主包 < 2MB，分包按需加载）
- 实现完整的 Mock API 层，模拟真实后端接口行为
- 沉淀可复用的业务组件和工具函数

---

## 二、包结构与路由设计

### 2.1 分包架构概览

```
┌─────────────────────────────────────────────────────────┐
│                      主包 (Main Package)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ 首页壳(Taro) │  │个人中心(Taro)│  │ 登录页(原生) │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
          │                    │
    ┌─────┴─────┐        ┌─────┴─────┐
    ▼           ▼        ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Taro分包1│ │Taro分包2│ │原生分包1│ │原生分包2│
│推荐视频 │ │搜索发现 │ │视频发布 │ │消息通知 │
└────────┘ └────────┘ └────────┘ └────────┘
```

### 2.2 详细页面路由

#### 主包页面

| 页面路径 | 类型 | 说明 |
|---------|------|------|
| `pages/index/index` | Taro | 首页壳页面，承载推荐/关注 Tab |
| `pages/profile/index` | Taro | 个人中心页面 |
| `pages/login/index` | 原生 | 登录/注册页面 |
| `pages/webview/index` | 原生 | 通用 WebView 容器 |

#### Taro 分包 - 推荐视频流 (packageVideo)

| 页面路径 | 说明 |
|---------|------|
| `packageVideo/pages/feed/index` | 推荐视频流（上下滑） |
| `packageVideo/pages/detail/index` | 视频详情页 |
| `packageVideo/pages/comment/index` | 评论列表页 |
| `packageVideo/pages/user/index` | 用户主页 |

#### Taro 分包 - 搜索发现 (packageSearch)

| 页面路径 | 说明 |
|---------|------|
| `packageSearch/pages/index/index` | 搜索首页（热搜、历史） |
| `packageSearch/pages/result/index` | 搜索结果页 |
| `packageSearch/pages/topic/index` | 话题详情页 |

#### 原生分包 - 视频发布 (packagePublish)

| 页面路径 | 说明 |
|---------|------|
| `packagePublish/pages/choose/index` | 选择/拍摄视频 |
| `packagePublish/pages/edit/index` | 视频编辑页 |
| `packagePublish/pages/post/index` | 发布信息填写页 |

#### 原生分包 - 消息通知 (packageMessage)

| 页面路径 | 说明 |
|---------|------|
| `packageMessage/pages/index/index` | 消息中心首页 |
| `packageMessage/pages/likes/index` | 点赞通知列表 |
| `packageMessage/pages/comments/index` | 评论通知列表 |
| `packageMessage/pages/followers/index` | 新粉丝列表 |
| `packageMessage/pages/system/index` | 系统公告 |

---

## 三、app.json 完整配置

```json
{
  "pages": [
    "pages/index/index",
    "pages/profile/index",
    "pages/login/index",
    "pages/webview/index"
  ],
  "subpackages": [
    {
      "root": "packageVideo",
      "name": "video",
      "pages": [
        "pages/feed/index",
        "pages/detail/index",
        "pages/comment/index",
        "pages/user/index"
      ]
    },
    {
      "root": "packageSearch",
      "name": "search",
      "pages": [
        "pages/index/index",
        "pages/result/index",
        "pages/topic/index"
      ]
    },
    {
      "root": "packagePublish",
      "name": "publish",
      "pages": [
        "pages/choose/index",
        "pages/edit/index",
        "pages/post/index"
      ]
    },
    {
      "root": "packageMessage",
      "name": "message",
      "pages": [
        "pages/index/index",
        "pages/likes/index",
        "pages/comments/index",
        "pages/followers/index",
        "pages/system/index"
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["video"]
    },
    "pages/profile/index": {
      "network": "wifi",
      "packages": ["message"]
    }
  },
  "window": {
    "backgroundTextStyle": "dark",
    "navigationBarBackgroundColor": "#000000",
    "navigationBarTitleText": "抖音",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#000000"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#ffffff",
    "backgroundColor": "#000000",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "assets/tabbar/home.png",
        "selectedIconPath": "assets/tabbar/home-active.png"
      },
      {
        "pagePath": "pages/profile/index",
        "text": "我",
        "iconPath": "assets/tabbar/profile.png",
        "selectedIconPath": "assets/tabbar/profile-active.png"
      }
    ]
  },
  "permission": {
    "scope.userLocation": {
      "desc": "用于推荐附近的视频内容"
    }
  },
  "requiredPrivateInfos": ["chooseVideo", "chooseImage"],
  "lazyCodeLoading": "requiredComponents"
}
```

---

## 四、Taro 3 工程目录设计

```
src/
├── app.config.ts              # 小程序全局配置
├── app.tsx                    # 应用入口
├── app.scss                   # 全局样式
├── index.html                 # H5 入口（可选）
│
├── pages/                     # 主包 Taro 页面
│   ├── index/                 # 首页
│   │   ├── index.tsx
│   │   ├── index.config.ts
│   │   └── index.scss
│   └── profile/               # 个人中心
│       ├── index.tsx
│       ├── index.config.ts
│       └── index.scss
│
├── packageVideo/              # Taro 分包 - 视频流
│   └── pages/
│       ├── feed/
│       ├── detail/
│       ├── comment/
│       └── user/
│
├── packageSearch/             # Taro 分包 - 搜索
│   └── pages/
│       ├── index/
│       ├── result/
│       └── topic/
│
├── components/                # 公共组件
│   ├── VideoPlayer/           # 视频播放器
│   ├── VideoCard/             # 视频卡片
│   ├── CommentItem/           # 评论项
│   ├── UserAvatar/            # 用户头像
│   ├── ActionBar/             # 操作栏（点赞/评论/分享）
│   ├── SearchBar/             # 搜索栏
│   ├── TabBar/                # 自定义 TabBar
│   ├── Loading/               # 加载状态
│   └── Empty/                 # 空状态
│
├── stores/                    # 状态管理 (Zustand)
│   ├── index.ts               # Store 统一导出
│   ├── userStore.ts           # 用户状态
│   ├── videoStore.ts          # 视频状态
│   ├── messageStore.ts        # 消息状态
│   └── appStore.ts            # 应用全局状态
│
├── services/                  # API 服务层
│   ├── index.ts               # 服务统一导出
│   ├── request.ts             # 请求封装
│   ├── videoService.ts        # 视频相关接口
│   ├── userService.ts         # 用户相关接口
│   ├── commentService.ts      # 评论相关接口
│   ├── searchService.ts       # 搜索相关接口
│   └── messageService.ts      # 消息相关接口
│
├── mock/                      # Mock 数据
│   ├── index.ts               # Mock 路由注册
│   ├── video.ts               # 视频 Mock 数据
│   ├── user.ts                # 用户 Mock 数据
│   ├── comment.ts             # 评论 Mock 数据
│   ├── search.ts              # 搜索 Mock 数据
│   └── message.ts             # 消息 Mock 数据
│
├── types/                     # TypeScript 类型定义
│   ├── index.ts               # 类型统一导出
│   ├── video.ts               # 视频相关类型
│   ├── user.ts                # 用户相关类型
│   ├── comment.ts             # 评论相关类型
│   ├── api.ts                 # API 通用类型
│   └── global.d.ts            # 全局类型声明
│
├── utils/                     # 工具函数
│   ├── index.ts               # 工具统一导出
│   ├── format.ts              # 格式化工具
│   ├── storage.ts             # 本地存储
│   ├── validator.ts           # 校验工具
│   ├── navigation.ts          # 路由导航
│   └── logger.ts              # 日志工具
│
├── constants/                 # 常量定义
│   ├── index.ts
│   ├── api.ts                 # API 路径常量
│   ├── storage.ts             # Storage Key 常量
│   └── event.ts               # 事件名常量
│
├── hooks/                     # 自定义 Hooks
│   ├── useRequest.ts          # 请求 Hook
│   ├── useUser.ts             # 用户 Hook
│   ├── useVideo.ts            # 视频 Hook
│   └── useInfiniteScroll.ts   # 无限滚动 Hook
│
└── assets/                    # 静态资源
    ├── images/
    ├── icons/
    └── tabbar/
```

### 目录职责说明

| 目录 | 职责 |
|------|------|
| `pages/` | 主包 Taro 页面，包含首页和个人中心 |
| `packageVideo/` | 视频相关分包，包含视频流、详情、评论、用户主页 |
| `packageSearch/` | 搜索相关分包，包含搜索首页、结果、话题 |
| `components/` | 可复用的业务组件，按功能模块划分 |
| `stores/` | Zustand 状态管理，按业务域拆分 |
| `services/` | API 调用层，封装所有后端接口请求 |
| `mock/` | Mock 数据和 Mock 服务，模拟后端响应 |
| `types/` | TypeScript 类型定义，确保类型安全 |
| `utils/` | 纯函数工具集，无副作用 |
| `constants/` | 常量定义，避免魔法字符串 |
| `hooks/` | 自定义 React Hooks，复用状态逻辑 |
| `assets/` | 图片、图标等静态资源 |

---

## 五、原生小程序目录设计

```
native/
├── pages/                     # 原生主包页面
│   ├── login/                 # 登录页
│   │   ├── index.json
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.js
│   └── webview/               # WebView 容器
│       ├── index.json
│       ├── index.wxml
│       ├── index.wxss
│       └── index.js
│
├── packagePublish/            # 原生分包 - 视频发布
│   ├── pages/
│   │   ├── choose/            # 选择视频
│   │   ├── edit/              # 编辑视频
│   │   └── post/              # 发布填写
│   └── components/            # 分包内组件
│       ├── video-preview/
│       └── tag-selector/
│
├── packageMessage/            # 原生分包 - 消息通知
│   ├── pages/
│   │   ├── index/             # 消息中心
│   │   ├── likes/             # 点赞通知
│   │   ├── comments/          # 评论通知
│   │   ├── followers/         # 新粉丝
│   │   └── system/            # 系统公告
│   └── components/            # 分包内组件
│       ├── message-item/
│       └── notification-badge/
│
├── components/                # 原生公共组件
│   ├── nav-bar/               # 自定义导航栏
│   ├── loading/               # 加载组件
│   └── modal/                 # 弹窗组件
│
├── utils/                     # 原生工具函数
│   ├── request.js             # 请求封装
│   ├── storage.js             # 存储工具
│   └── util.js                # 通用工具
│
└── wxs/                       # WXS 脚本
    └── format.wxs             # 格式化脚本
```

---

## 六、后续扩展建议

1. **后端接入**
   - 替换 Mock 层为真实 API 调用
   - 接入 JWT Token 鉴权机制
   - 实现 Token 刷新和请求重试

2. **视频能力增强**
   - 接入云存储实现真实视频上传
   - 集成视频转码和封面截取
   - 实现视频预加载和缓存策略

3. **推荐算法埋点**
   - 埋点用户行为（播放时长、完播率、互动）
   - 设计曝光和点击的上报机制
   - 为推荐算法提供数据基础

4. **大模型能力接入**
   - AI 智能文案生成
   - 自动话题推荐
   - 视频内容审核
   - 智能评论回复建议

5. **性能优化**
   - 骨架屏优化首屏体验
   - 图片懒加载和 CDN 优化
   - 分包预下载策略优化

6. **工程化增强**
   - CI/CD 自动化部署
   - 单元测试和 E2E 测试
   - 性能监控和错误上报
