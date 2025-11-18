/**
 * SWR风格的请求缓存Hook
 *
 * 【学习要点】
 * 1. Stale-While-Revalidate策略 - 先返回缓存，后台更新
 * 2. 自动重新验证 - 窗口聚焦、网络恢复时
 * 3. 去重请求 - 相同key的请求合并
 * 4. 乐观更新 - 立即更新UI，后台同步
 * 5. 错误重试 - 指数退避策略
 * 6. 依赖请求 - 串行请求处理
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import Taro from '@tarojs/taro'

// ==================== 类型定义 ====================

interface CacheItem<T> {
  data: T
  timestamp: number
  isValidating: boolean
}

interface RequestConfig<T> {
  // 初始数据
  initialData?: T
  // 缓存时间 (ms)，0表示不缓存
  cacheTime?: number
  // 过期时间 (ms)，超过则后台重新获取
  staleTime?: number
  // 自动重新获取间隔 (ms)，0表示不自动
  refreshInterval?: number
  // 页面聚焦时重新获取
  revalidateOnFocus?: boolean
  // 网络恢复时重新获取
  revalidateOnReconnect?: boolean
  // 组件挂载时获取
  revalidateOnMount?: boolean
  // 重试次数
  retryCount?: number
  // 重试延迟 (ms)
  retryDelay?: number
  // 请求去重时间窗口 (ms)
  dedupingInterval?: number
  // 成功回调
  onSuccess?: (data: T) => void
  // 错误回调
  onError?: (error: Error) => void
  // 依赖项，为false时不发起请求
  enabled?: boolean
}

interface RequestState<T> {
  data: T | undefined
  error: Error | undefined
  isLoading: boolean
  isValidating: boolean
  isStale: boolean
}

interface RequestReturn<T> extends RequestState<T> {
  mutate: (data?: T | ((prev: T | undefined) => T), revalidate?: boolean) => Promise<void>
  revalidate: () => Promise<void>
}

// ==================== 全局缓存 ====================

const cache = new Map<string, CacheItem<any>>()
const fetching = new Map<string, Promise<any>>()
const subscribers = new Map<string, Set<() => void>>()

// ==================== 工具函数 ====================

function getCache<T>(key: string): CacheItem<T> | undefined {
  return cache.get(key)
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    isValidating: false,
  })
  // 通知订阅者
  subscribers.get(key)?.forEach(callback => callback())
}

function subscribe(key: string, callback: () => void): () => void {
  if (!subscribers.has(key)) {
    subscribers.set(key, new Set())
  }
  subscribers.get(key)!.add(callback)

  return () => {
    subscribers.get(key)?.delete(callback)
  }
}

// ==================== 主Hook ====================

export function useRequest<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  config: RequestConfig<T> = {}
): RequestReturn<T> {
  const {
    initialData,
    cacheTime = 5 * 60 * 1000, // 5分钟
    staleTime = 0, // 默认立即过期
    refreshInterval = 0,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    revalidateOnMount = true,
    retryCount = 3,
    retryDelay = 1000,
    dedupingInterval = 2000,
    onSuccess,
    onError,
    enabled = true,
  } = config

  // 状态
  const [state, setState] = useState<RequestState<T>>(() => {
    const cached = key ? getCache<T>(key) : undefined
    return {
      data: cached?.data ?? initialData,
      error: undefined,
      isLoading: !cached && enabled,
      isValidating: false,
      isStale: cached ? Date.now() - cached.timestamp > staleTime : true,
    }
  })

  // Refs
  const mountedRef = useRef(true)
  const retryCountRef = useRef(0)
  const lastFetchTimeRef = useRef(0)

  // 带重试的获取函数
  const fetchWithRetry = useCallback(async (): Promise<T> => {
    try {
      const data = await fetcher()
      retryCountRef.current = 0
      return data
    } catch (error) {
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++
        const delay = retryDelay * Math.pow(2, retryCountRef.current - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
        return fetchWithRetry()
      }
      throw error
    }
  }, [fetcher, retryCount, retryDelay])

  // 重新验证
  const revalidate = useCallback(async (): Promise<void> => {
    if (!key || !enabled) return

    // 去重检查
    const now = Date.now()
    if (now - lastFetchTimeRef.current < dedupingInterval) {
      // 等待正在进行的请求
      const existingFetch = fetching.get(key)
      if (existingFetch) {
        await existingFetch
      }
      return
    }
    lastFetchTimeRef.current = now

    // 检查是否有正在进行的请求
    let fetchPromise = fetching.get(key)
    if (!fetchPromise) {
      // 更新状态
      setState(prev => ({ ...prev, isValidating: true }))

      fetchPromise = fetchWithRetry()
      fetching.set(key, fetchPromise)

      try {
        const data = await fetchPromise

        if (mountedRef.current) {
          setCache(key, data)
          setState({
            data,
            error: undefined,
            isLoading: false,
            isValidating: false,
            isStale: false,
          })
          onSuccess?.(data)
        }
      } catch (error) {
        if (mountedRef.current) {
          const err = error instanceof Error ? error : new Error(String(error))
          setState(prev => ({
            ...prev,
            error: err,
            isLoading: false,
            isValidating: false,
          }))
          onError?.(err)
        }
      } finally {
        fetching.delete(key)
      }
    } else {
      // 等待已有请求
      try {
        await fetchPromise
      } catch {
        // 错误已在原始请求中处理
      }
    }
  }, [key, enabled, dedupingInterval, fetchWithRetry, onSuccess, onError])

  // 手动更新缓存
  const mutate = useCallback(async (
    data?: T | ((prev: T | undefined) => T),
    shouldRevalidate: boolean = true
  ): Promise<void> => {
    if (!key) return

    if (data !== undefined) {
      const newData = typeof data === 'function'
        ? (data as (prev: T | undefined) => T)(state.data)
        : data

      // 乐观更新
      setCache(key, newData)
      setState(prev => ({
        ...prev,
        data: newData,
        isStale: true,
      }))
    }

    // 重新验证
    if (shouldRevalidate) {
      await revalidate()
    }
  }, [key, state.data, revalidate])

  // 初始加载
  useEffect(() => {
    if (!key || !enabled) return

    const cached = getCache<T>(key)
    const isExpired = !cached || Date.now() - cached.timestamp > cacheTime

    if (revalidateOnMount || isExpired) {
      revalidate()
    }
  }, [key, enabled, revalidateOnMount, cacheTime, revalidate])

  // 订阅缓存更新
  useEffect(() => {
    if (!key) return

    return subscribe(key, () => {
      const cached = getCache<T>(key)
      if (cached && mountedRef.current) {
        setState(prev => ({
          ...prev,
          data: cached.data,
        }))
      }
    })
  }, [key])

  // 自动刷新
  useEffect(() => {
    if (!key || !enabled || refreshInterval <= 0) return

    const interval = setInterval(revalidate, refreshInterval)
    return () => clearInterval(interval)
  }, [key, enabled, refreshInterval, revalidate])

  // 页面聚焦重新获取
  useEffect(() => {
    if (!key || !enabled || !revalidateOnFocus) return

    const handleFocus = () => {
      revalidate()
    }

    // 小程序页面显示事件
    Taro.eventCenter.on('PAGE_SHOW', handleFocus)
    return () => {
      Taro.eventCenter.off('PAGE_SHOW', handleFocus)
    }
  }, [key, enabled, revalidateOnFocus, revalidate])

  // 网络恢复重新获取
  useEffect(() => {
    if (!key || !enabled || !revalidateOnReconnect) return

    const handleReconnect = (res: Taro.onNetworkStatusChange.CallbackResult) => {
      if (res.isConnected) {
        revalidate()
      }
    }

    Taro.onNetworkStatusChange(handleReconnect)
    return () => {
      Taro.offNetworkStatusChange(handleReconnect)
    }
  }, [key, enabled, revalidateOnReconnect, revalidate])

  // 清理
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    ...state,
    mutate,
    revalidate,
  }
}

// ==================== 辅助Hooks ====================

/**
 * 无限加载Hook
 */
export function useInfiniteRequest<T>(
  getKey: (pageIndex: number, previousData: T | null) => string | null,
  fetcher: (key: string) => Promise<T>,
  config: RequestConfig<T[]> = {}
) {
  const [pages, setPages] = useState<T[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = useCallback(async () => {
    const key = getKey(pageIndex, pages[pages.length - 1] || null)
    if (!key || isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const data = await fetcher(key)
      setPages(prev => [...prev, data])
      setPageIndex(prev => prev + 1)

      // 检查是否还有更多
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setHasMore(false)
      }
    } finally {
      setIsLoadingMore(false)
    }
  }, [pageIndex, pages, getKey, fetcher, isLoadingMore, hasMore])

  const refresh = useCallback(async () => {
    setPages([])
    setPageIndex(0)
    setHasMore(true)
  }, [])

  return {
    pages,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  }
}

/**
 * 预取数据
 */
export function prefetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  return fetcher().then(data => {
    setCache(key, data)
    return data
  })
}

/**
 * 清除缓存
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

/**
 * 获取缓存数据
 */
export function getCachedData<T>(key: string): T | undefined {
  return getCache<T>(key)?.data
}

export default useRequest
