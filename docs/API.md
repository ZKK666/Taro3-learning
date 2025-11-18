# API 接口文档

## 通用说明

### 请求基础

- **Base URL**: `/mock/api` (Mock 模式)
- **Content-Type**: `application/json`
- **Authorization**: `Bearer {token}` (需要鉴权的接口)

### 响应格式

```typescript
interface ApiResponse<T> {
  code: number       // 业务状态码，0 表示成功
  message: string    // 状态描述
  data: T           // 响应数据
  timestamp: number  // 时间戳
}
```

### 分页格式

```typescript
interface PaginationData<T> {
  list: T[]         // 数据列表
  total: number     // 总数
  page: number      // 当前页
  pageSize: number  // 每页数量
  hasMore: boolean  // 是否有更多
}
```

---

## 视频模块

### 获取视频列表

**GET** `/video/list`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 列表类型：recommend-推荐, following-关注, nearby-附近 |
| page | number | 是 | 页码 |
| pageSize | number | 是 | 每页数量 |

响应数据：
```typescript
PaginationData<VideoInfo>
```

### 获取视频详情

**GET** `/video/detail`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| videoId | string | 是 | 视频 ID |

响应数据：
```typescript
interface VideoInfo {
  id: string
  title: string           // 标题
  description: string     // 描述
  coverUrl: string        // 封面 URL
  videoUrl: string        // 视频 URL
  duration: number        // 时长（秒）
  width: number          // 宽度
  height: number         // 高度
  playCount: number      // 播放数
  likeCount: number      // 点赞数
  commentCount: number   // 评论数
  shareCount: number     // 分享数
  collectCount: number   // 收藏数
  isLiked: boolean       // 是否已点赞
  isCollected: boolean   // 是否已收藏
  author: UserInfo       // 作者信息
  topics: TopicInfo[]    // 话题标签
  createTime: string     // 创建时间
  visibility: string     // 可见范围
}
```

### 点赞视频

**POST** `/video/like`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| videoId | string | 是 | 视频 ID |

响应数据：
```typescript
{ likeCount: number }
```

### 取消点赞

**POST** `/video/unlike`

请求参数同上。

### 收藏视频

**POST** `/video/collect`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| videoId | string | 是 | 视频 ID |

响应数据：
```typescript
{ collectCount: number }
```

### 发布视频

**POST** `/video/publish`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| videoPath | string | 是 | 视频本地路径 |
| coverPath | string | 是 | 封面本地路径 |
| title | string | 是 | 标题 |
| description | string | 否 | 描述 |
| topicIds | string[] | 否 | 话题 ID 列表 |
| visibility | string | 是 | 可见范围 |

响应数据：
```typescript
{
  videoId: string
  status: 'processing' | 'success' | 'failed'
  message: string
}
```

---

## 用户模块

### 微信登录

**POST** `/user/login`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 微信登录 code |
| userInfo | object | 否 | 用户信息（首次登录需要） |

响应数据：
```typescript
{
  token: string
  userInfo: UserInfo
  isNewUser: boolean
}
```

### 获取当前用户信息

**GET** `/user/info`

响应数据：
```typescript
interface UserDetail {
  id: string
  nickname: string       // 昵称
  avatarUrl: string      // 头像
  bio: string            // 简介
  gender: number         // 性别
  uniqueId: string       // 抖音号
  isVerified: boolean    // 是否认证
  stats: {
    followingCount: number   // 关注数
    followerCount: number    // 粉丝数
    likeCount: number        // 获赞数
    worksCount: number       // 作品数
    likesCount: number       // 喜欢数
  }
}
```

### 获取用户详情

**GET** `/user/detail`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户 ID |

### 关注用户

**POST** `/user/follow`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户 ID |

响应数据：
```typescript
{ isFollowed: boolean }
```

### 获取关注/粉丝列表

**GET** `/user/follow-list`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户 ID |
| type | string | 是 | 类型：following-关注, followers-粉丝 |
| page | number | 是 | 页码 |
| pageSize | number | 是 | 每页数量 |

---

## 评论模块

### 获取评论列表

**GET** `/comment/list`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| videoId | string | 是 | 视频 ID |
| sortBy | string | 否 | 排序：hot-热门, time-时间 |
| page | number | 是 | 页码 |
| pageSize | number | 是 | 每页数量 |

响应数据：
```typescript
PaginationData<CommentInfo>

interface CommentInfo {
  id: string
  videoId: string
  content: string        // 评论内容
  likeCount: number      // 点赞数
  replyCount: number     // 回复数
  isLiked: boolean       // 是否已点赞
  user: UserInfo         // 评论用户
  createTime: string     // 创建时间
  replies: ReplyInfo[]   // 回复列表
  hasMoreReplies: boolean
}
```

### 发表评论

**POST** `/comment/post`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| videoId | string | 是 | 视频 ID |
| content | string | 是 | 评论内容 |
| atUserIds | string[] | 否 | @用户 ID 列表 |

响应数据：
```typescript
{
  id: string
  createTime: string
}
```

---

## 搜索模块

### 搜索

**GET** `/search/query`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| type | string | 是 | 搜索类型：video-视频, user-用户, topic-话题 |
| page | number | 是 | 页码 |
| pageSize | number | 是 | 每页数量 |

### 获取热搜列表

**GET** `/search/hot`

响应数据：
```typescript
interface HotSearchItem {
  id: string
  rank: number           // 排名
  keyword: string        // 关键词
  hotValue: number       // 热度值
  tag?: string          // 标签：hot, new, recommend
}[]
```

### 获取搜索历史

**GET** `/search/history`

响应数据：
```typescript
interface SearchHistory {
  keyword: string
  searchTime: string
}[]
```

---

## 消息模块

### 获取消息中心数据

**GET** `/message/center`

响应数据：
```typescript
{
  unreadCount: {
    total: number
    like: number
    comment: number
    follow: number
    at: number
    system: number
  }
  previews: {
    like?: LikeMessage
    comment?: CommentMessage
    follow?: FollowMessage
    system?: SystemMessage
  }
}
```

### 获取消息列表

**GET** `/message/list`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 消息类型：like, comment, follow, system, all |
| page | number | 是 | 页码 |
| pageSize | number | 是 | 每页数量 |

### 标记消息已读

**POST** `/message/read`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| messageIds | string[] | 是 | 消息 ID 列表 |

### 标记全部已读

**POST** `/message/read-all`

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 消息类型，不传则全部标记已读 |
