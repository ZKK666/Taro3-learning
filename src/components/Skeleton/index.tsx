/**
 * 骨架屏组件
 *
 * 【学习要点】
 * 1. 骨架屏设计原则 - 模拟真实布局
 * 2. 闪烁动画实现 - CSS shimmer效果
 * 3. 组合模式 - 基础组件组合成复杂骨架
 * 4. 条件渲染 - loading状态管理
 * 5. 性能优化 - 避免重绘
 */

import { View } from '@tarojs/components'
import { CSSProperties, ReactNode } from 'react'
import styles from './index.module.scss'

// ==================== 基础骨架组件 ====================

interface SkeletonBaseProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: CSSProperties
  animate?: boolean
  className?: string
}

/**
 * 骨架基础块
 */
export function SkeletonBlock({
  width = '100%',
  height = 16,
  borderRadius = 4,
  style,
  animate = true,
  className = '',
}: SkeletonBaseProps) {
  return (
    <View
      className={`${styles.block} ${animate ? styles.animate : ''} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        ...style,
      }}
    />
  )
}

/**
 * 骨架圆形
 */
export function SkeletonCircle({
  size = 40,
  animate = true,
  className = '',
  style,
}: {
  size?: number
  animate?: boolean
  className?: string
  style?: CSSProperties
}) {
  return (
    <SkeletonBlock
      width={size}
      height={size}
      borderRadius="50%"
      animate={animate}
      className={className}
      style={style}
    />
  )
}

/**
 * 骨架文本行
 */
export function SkeletonText({
  lines = 1,
  lineHeight = 16,
  spacing = 8,
  lastLineWidth = '60%',
  animate = true,
}: {
  lines?: number
  lineHeight?: number
  spacing?: number
  lastLineWidth?: string
  animate?: boolean
}) {
  return (
    <View className={styles.textWrapper}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBlock
          key={index}
          height={lineHeight}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
          animate={animate}
          style={{ marginTop: index > 0 ? spacing : 0 }}
        />
      ))}
    </View>
  )
}

/**
 * 骨架图片
 */
export function SkeletonImage({
  width = '100%',
  height = 200,
  borderRadius = 8,
  animate = true,
}: {
  width?: string | number
  height?: number
  borderRadius?: number
  animate?: boolean
}) {
  return (
    <SkeletonBlock
      width={width}
      height={height}
      borderRadius={borderRadius}
      animate={animate}
    />
  )
}

// ==================== 复合骨架组件 ====================

/**
 * 视频卡片骨架
 */
export function VideoCardSkeleton({ animate = true }: { animate?: boolean }) {
  return (
    <View className={styles.videoCard}>
      {/* 视频封面 */}
      <SkeletonImage height={200} animate={animate} />

      {/* 底部信息 */}
      <View className={styles.videoInfo}>
        <SkeletonCircle size={36} animate={animate} />
        <View className={styles.videoMeta}>
          <SkeletonBlock width="80%" height={14} animate={animate} />
          <SkeletonBlock width="50%" height={12} animate={animate} style={{ marginTop: 6 }} />
        </View>
      </View>
    </View>
  )
}

/**
 * 视频Feed骨架 (全屏)
 */
export function VideoFeedSkeleton({ animate = true }: { animate?: boolean }) {
  return (
    <View className={styles.videoFeed}>
      {/* 视频区域 */}
      <SkeletonBlock width="100%" height="100%" borderRadius={0} animate={animate} />

      {/* 右侧操作栏 */}
      <View className={styles.feedActions}>
        <SkeletonCircle size={48} animate={animate} />
        <SkeletonCircle size={44} animate={animate} />
        <SkeletonCircle size={44} animate={animate} />
        <SkeletonCircle size={44} animate={animate} />
        <SkeletonCircle size={44} animate={animate} />
      </View>

      {/* 底部信息 */}
      <View className={styles.feedBottom}>
        <SkeletonBlock width="40%" height={18} animate={animate} />
        <SkeletonBlock width="80%" height={14} animate={animate} style={{ marginTop: 8 }} />
        <SkeletonBlock width="60%" height={14} animate={animate} style={{ marginTop: 6 }} />
      </View>
    </View>
  )
}

/**
 * 用户列表项骨架
 */
export function UserItemSkeleton({ animate = true }: { animate?: boolean }) {
  return (
    <View className={styles.userItem}>
      <SkeletonCircle size={48} animate={animate} />
      <View className={styles.userInfo}>
        <SkeletonBlock width="60%" height={16} animate={animate} />
        <SkeletonBlock width="40%" height={12} animate={animate} style={{ marginTop: 6 }} />
      </View>
      <SkeletonBlock width={60} height={28} borderRadius={14} animate={animate} />
    </View>
  )
}

/**
 * 个人资料骨架
 */
export function ProfileSkeleton({ animate = true }: { animate?: boolean }) {
  return (
    <View className={styles.profile}>
      {/* 头部背景 */}
      <SkeletonBlock width="100%" height={200} borderRadius={0} animate={animate} />

      {/* 用户信息 */}
      <View className={styles.profileInfo}>
        <SkeletonCircle size={80} animate={animate} />
        <SkeletonBlock width="40%" height={20} animate={animate} style={{ marginTop: 12 }} />
        <SkeletonBlock width="60%" height={14} animate={animate} style={{ marginTop: 8 }} />

        {/* 统计数据 */}
        <View className={styles.profileStats}>
          <View className={styles.statItem}>
            <SkeletonBlock width={40} height={20} animate={animate} />
            <SkeletonBlock width={30} height={12} animate={animate} style={{ marginTop: 4 }} />
          </View>
          <View className={styles.statItem}>
            <SkeletonBlock width={40} height={20} animate={animate} />
            <SkeletonBlock width={30} height={12} animate={animate} style={{ marginTop: 4 }} />
          </View>
          <View className={styles.statItem}>
            <SkeletonBlock width={40} height={20} animate={animate} />
            <SkeletonBlock width={30} height={12} animate={animate} style={{ marginTop: 4 }} />
          </View>
        </View>
      </View>

      {/* 作品网格 */}
      <View className={styles.worksGrid}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <SkeletonBlock key={i} height={150} borderRadius={4} animate={animate} />
        ))}
      </View>
    </View>
  )
}

/**
 * 评论列表骨架
 */
export function CommentListSkeleton({
  count = 5,
  animate = true,
}: {
  count?: number
  animate?: boolean
}) {
  return (
    <View className={styles.commentList}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className={styles.commentItem}>
          <SkeletonCircle size={36} animate={animate} />
          <View className={styles.commentContent}>
            <SkeletonBlock width="30%" height={14} animate={animate} />
            <SkeletonText lines={2} lineHeight={12} spacing={6} animate={animate} />
            <View className={styles.commentActions}>
              <SkeletonBlock width={40} height={12} animate={animate} />
              <SkeletonBlock width={40} height={12} animate={animate} />
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

/**
 * 直播列表骨架
 */
export function LiveListSkeleton({
  count = 4,
  animate = true,
}: {
  count?: number
  animate?: boolean
}) {
  return (
    <View className={styles.liveList}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className={styles.liveItem}>
          <SkeletonImage height={120} borderRadius={8} animate={animate} />
          <View className={styles.liveInfo}>
            <SkeletonBlock width="70%" height={14} animate={animate} />
            <View className={styles.liveUser}>
              <SkeletonCircle size={20} animate={animate} />
              <SkeletonBlock width="40%" height={12} animate={animate} />
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

// ==================== 骨架屏容器 ====================

interface SkeletonWrapperProps {
  loading: boolean
  skeleton: ReactNode
  children: ReactNode
  delay?: number // 延迟显示骨架屏，避免闪烁
}

/**
 * 骨架屏容器
 * 根据loading状态切换显示骨架屏或内容
 */
export function SkeletonWrapper({
  loading,
  skeleton,
  children,
  delay = 0,
}: SkeletonWrapperProps) {
  // 可以添加延迟逻辑避免闪烁
  // const [showSkeleton, setShowSkeleton] = useState(false)
  // useEffect(() => {
  //   if (loading && delay > 0) {
  //     const timer = setTimeout(() => setShowSkeleton(true), delay)
  //     return () => clearTimeout(timer)
  //   }
  //   setShowSkeleton(loading)
  // }, [loading, delay])

  return loading ? <>{skeleton}</> : <>{children}</>
}

// 导出所有组件
export {
  SkeletonBlock as Block,
  SkeletonCircle as Circle,
  SkeletonText as Text,
  SkeletonImage as Image,
}

export default {
  Block: SkeletonBlock,
  Circle: SkeletonCircle,
  Text: SkeletonText,
  Image: SkeletonImage,
  VideoCard: VideoCardSkeleton,
  VideoFeed: VideoFeedSkeleton,
  UserItem: UserItemSkeleton,
  Profile: ProfileSkeleton,
  CommentList: CommentListSkeleton,
  LiveList: LiveListSkeleton,
  Wrapper: SkeletonWrapper,
}
