/**
 * 虚拟列表组件
 *
 * 用于高效渲染大量数据的列表，只渲染可视区域内的元素
 *
 * 【核心原理】
 * 1. 计算可视区域能显示多少条数据
 * 2. 根据滚动位置计算当前应该显示哪些数据
 * 3. 只渲染可视区域 + 缓冲区的数据
 * 4. 使用 transform 偏移来模拟完整列表的滚动效果
 *
 * 【性能优势】
 * - 10000条数据也能流畅滚动
 * - 内存占用恒定（只和可视区域大小有关）
 * - DOM节点数量固定
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { View, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

// ==================== 类型定义 ====================

/**
 * 列表项数据
 */
export interface VirtualListItem {
  /** 唯一标识 */
  id: string | number
  /** 其他数据 */
  [key: string]: any
}

/**
 * 虚拟列表Props
 */
export interface VirtualListProps<T extends VirtualListItem> {
  /** 列表数据 */
  data: T[]
  /** 每项高度（固定高度模式） */
  itemHeight: number
  /** 列表容器高度 */
  height: number
  /** 缓冲区大小（可视区域外额外渲染的项数） */
  buffer?: number
  /** 渲染每一项的函数 */
  renderItem: (item: T, index: number) => React.ReactNode
  /** 滚动事件回调 */
  onScroll?: (scrollTop: number) => void
  /** 触底加载更多 */
  onLoadMore?: () => void
  /** 触底阈值（距离底部多少像素触发） */
  loadMoreThreshold?: number
  /** 是否正在加载 */
  loading?: boolean
  /** 空数据展示 */
  emptyText?: string
  /** 自定义类名 */
  className?: string
}

/**
 * 虚拟列表组件
 */
export function VirtualList<T extends VirtualListItem>({
  data,
  itemHeight,
  height,
  buffer = 5,
  renderItem,
  onScroll,
  onLoadMore,
  loadMoreThreshold = 100,
  loading = false,
  emptyText = '暂无数据',
  className = '',
}: VirtualListProps<T>) {
  // 滚动位置
  const [scrollTop, setScrollTop] = useState(0)

  // 容器引用
  const containerRef = useRef<any>(null)

  // 是否已触发加载更多（防止重复触发）
  const loadingMoreRef = useRef(false)

  // ==================== 核心计算 ====================

  /**
   * 计算可视区域能显示的项数
   */
  const visibleCount = useMemo(() => {
    return Math.ceil(height / itemHeight)
  }, [height, itemHeight])

  /**
   * 计算起始索引（第一个可见项）
   */
  const startIndex = useMemo(() => {
    const index = Math.floor(scrollTop / itemHeight)
    // 减去缓冲区，但不能小于0
    return Math.max(0, index - buffer)
  }, [scrollTop, itemHeight, buffer])

  /**
   * 计算结束索引（最后一个可见项）
   */
  const endIndex = useMemo(() => {
    const index = startIndex + visibleCount + buffer * 2
    // 不能超过数据长度
    return Math.min(data.length, index)
  }, [startIndex, visibleCount, buffer, data.length])

  /**
   * 获取当前需要渲染的数据
   */
  const visibleData = useMemo(() => {
    return data.slice(startIndex, endIndex)
  }, [data, startIndex, endIndex])

  /**
   * 计算列表总高度
   */
  const totalHeight = useMemo(() => {
    return data.length * itemHeight
  }, [data.length, itemHeight])

  /**
   * 计算偏移量（将可见元素定位到正确位置）
   */
  const offsetY = useMemo(() => {
    return startIndex * itemHeight
  }, [startIndex, itemHeight])

  // ==================== 事件处理 ====================

  /**
   * 处理滚动事件
   */
  const handleScroll = useCallback((e: any) => {
    const newScrollTop = e.detail.scrollTop
    setScrollTop(newScrollTop)

    // 回调
    onScroll?.(newScrollTop)

    // 检查是否需要加载更多
    if (onLoadMore && !loading && !loadingMoreRef.current) {
      const scrollHeight = totalHeight
      const clientHeight = height
      const distanceToBottom = scrollHeight - newScrollTop - clientHeight

      if (distanceToBottom < loadMoreThreshold) {
        loadingMoreRef.current = true
        onLoadMore()
      }
    }
  }, [onScroll, onLoadMore, loading, totalHeight, height, loadMoreThreshold])

  // 重置加载状态
  useEffect(() => {
    if (!loading) {
      loadingMoreRef.current = false
    }
  }, [loading])

  // ==================== 渲染 ====================

  // 空数据
  if (data.length === 0) {
    return (
      <View className={`${styles.container} ${className}`} style={{ height: `${height}px` }}>
        <View className={styles.empty}>{emptyText}</View>
      </View>
    )
  }

  return (
    <ScrollView
      className={`${styles.container} ${className}`}
      scrollY
      style={{ height: `${height}px` }}
      onScroll={handleScroll}
      scrollWithAnimation={false}
      enhanced
      showScrollbar={false}
    >
      {/* 占位容器，撑起完整高度 */}
      <View className={styles.phantom} style={{ height: `${totalHeight}px` }}>
        {/* 实际渲染的列表项 */}
        <View
          className={styles.content}
          style={{ transform: `translateY(${offsetY}px)` }}
        >
          {visibleData.map((item, index) => (
            <View
              key={item.id}
              className={styles.item}
              style={{ height: `${itemHeight}px` }}
            >
              {renderItem(item, startIndex + index)}
            </View>
          ))}
        </View>
      </View>

      {/* 加载中提示 */}
      {loading && (
        <View className={styles.loading}>
          <View className={styles.spinner} />
          加载中...
        </View>
      )}
    </ScrollView>
  )
}

// ==================== 动态高度版本 ====================

/**
 * 动态高度虚拟列表Props
 */
export interface DynamicVirtualListProps<T extends VirtualListItem> {
  /** 列表数据 */
  data: T[]
  /** 预估项高度 */
  estimatedItemHeight: number
  /** 列表容器高度 */
  height: number
  /** 缓冲区大小 */
  buffer?: number
  /** 渲染每一项的函数 */
  renderItem: (item: T, index: number) => React.ReactNode
  /** 滚动事件回调 */
  onScroll?: (scrollTop: number) => void
  /** 触底加载更多 */
  onLoadMore?: () => void
  /** 自定义类名 */
  className?: string
}

/**
 * 动态高度虚拟列表
 *
 * 【实现原理】
 * 1. 先用预估高度渲染
 * 2. 渲染后测量真实高度并缓存
 * 3. 根据缓存的真实高度计算位置
 */
export function DynamicVirtualList<T extends VirtualListItem>({
  data,
  estimatedItemHeight,
  height,
  buffer = 5,
  renderItem,
  onScroll,
  onLoadMore,
  className = '',
}: DynamicVirtualListProps<T>) {
  // 滚动位置
  const [scrollTop, setScrollTop] = useState(0)

  // 缓存每项的高度和位置
  const [positions, setPositions] = useState<Array<{
    index: number
    top: number
    bottom: number
    height: number
  }>>([])

  // 初始化位置信息
  useEffect(() => {
    const newPositions = data.map((_, index) => ({
      index,
      top: index * estimatedItemHeight,
      bottom: (index + 1) * estimatedItemHeight,
      height: estimatedItemHeight,
    }))
    setPositions(newPositions)
  }, [data.length, estimatedItemHeight])

  /**
   * 二分查找起始索引
   */
  const findStartIndex = useCallback((scrollTop: number) => {
    let left = 0
    let right = positions.length - 1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const midBottom = positions[mid]?.bottom || 0

      if (midBottom === scrollTop) {
        return mid + 1
      } else if (midBottom < scrollTop) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }

    return left
  }, [positions])

  // 计算可视区域
  const startIndex = useMemo(() => {
    return Math.max(0, findStartIndex(scrollTop) - buffer)
  }, [scrollTop, findStartIndex, buffer])

  const endIndex = useMemo(() => {
    const visibleCount = Math.ceil(height / estimatedItemHeight)
    return Math.min(data.length, startIndex + visibleCount + buffer * 2)
  }, [startIndex, height, estimatedItemHeight, buffer, data.length])

  const visibleData = useMemo(() => {
    return data.slice(startIndex, endIndex)
  }, [data, startIndex, endIndex])

  const totalHeight = useMemo(() => {
    return positions[positions.length - 1]?.bottom || 0
  }, [positions])

  const offsetY = useMemo(() => {
    return positions[startIndex]?.top || 0
  }, [positions, startIndex])

  /**
   * 更新项的真实高度
   */
  const updateItemHeight = useCallback((index: number, height: number) => {
    setPositions(prev => {
      const newPositions = [...prev]
      const oldHeight = newPositions[index]?.height || estimatedItemHeight
      const diff = height - oldHeight

      if (diff !== 0 && newPositions[index]) {
        newPositions[index].height = height
        newPositions[index].bottom = newPositions[index].top + height

        // 更新后续项的位置
        for (let i = index + 1; i < newPositions.length; i++) {
          newPositions[i].top = newPositions[i - 1].bottom
          newPositions[i].bottom = newPositions[i].top + newPositions[i].height
        }
      }

      return newPositions
    })
  }, [estimatedItemHeight])

  const handleScroll = useCallback((e: any) => {
    setScrollTop(e.detail.scrollTop)
    onScroll?.(e.detail.scrollTop)
  }, [onScroll])

  return (
    <ScrollView
      className={`${styles.container} ${className}`}
      scrollY
      style={{ height: `${height}px` }}
      onScroll={handleScroll}
      enhanced
      showScrollbar={false}
    >
      <View className={styles.phantom} style={{ height: `${totalHeight}px` }}>
        <View
          className={styles.content}
          style={{ transform: `translateY(${offsetY}px)` }}
        >
          {visibleData.map((item, index) => (
            <View key={item.id} className={styles.dynamicItem}>
              {renderItem(item, startIndex + index)}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default VirtualList
