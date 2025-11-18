/**
 * 组件统一导出
 *
 * 将所有公共UI组件统一导出，方便其他模块引用
 */

// 基础组件
export { default as SharePanel } from './SharePanel'
export { default as CommentSheet } from './CommentSheet'

// 高级功能组件
export { default as VirtualList, DynamicVirtualList } from './VirtualList'
export { default as Danmaku, generateMockDanmaku } from './Danmaku'
export type { DanmakuItem, DanmakuType, DanmakuProps } from './Danmaku'
export { default as VideoUpload } from './VideoUpload'
export type { UploadConfig, UploadResult, VideoUploadProps } from './VideoUpload'

// 骨架屏组件
export {
  default as Skeleton,
  SkeletonBlock,
  SkeletonCircle,
  SkeletonText,
  SkeletonImage,
  VideoCardSkeleton,
  VideoFeedSkeleton,
  UserItemSkeleton,
  ProfileSkeleton,
  CommentListSkeleton,
  LiveListSkeleton,
  SkeletonWrapper,
} from './Skeleton'
