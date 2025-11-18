/**
 * 视频预加载系统
 *
 * 【学习要点】
 * 1. LRU缓存策略 - 最近最少使用淘汰
 * 2. 预加载队列管理
 * 3. 内存管理与清理
 * 4. 网络状态感知
 * 5. 优先级调度
 */

import Taro from '@tarojs/taro'

// 缓存项接口
interface CacheItem {
  url: string
  size: number
  timestamp: number
  preloaded: boolean
  priority: number
}

// 预加载配置
interface PreloadConfig {
  maxCacheSize: number // 最大缓存大小 (bytes)
  maxCacheCount: number // 最大缓存数量
  preloadCount: number // 预加载数量
  timeout: number // 超时时间 (ms)
}

// 预加载状态
interface PreloadState {
  loading: Set<string>
  completed: Set<string>
  failed: Set<string>
}

class VideoPreloader {
  private cache: Map<string, CacheItem> = new Map()
  private config: PreloadConfig
  private state: PreloadState = {
    loading: new Set(),
    completed: new Set(),
    failed: new Set(),
  }
  private listeners: Map<string, ((status: 'success' | 'error') => void)[]> = new Map()

  constructor(config?: Partial<PreloadConfig>) {
    this.config = {
      maxCacheSize: 100 * 1024 * 1024, // 100MB
      maxCacheCount: 20,
      preloadCount: 3,
      timeout: 30000,
      ...config,
    }
  }

  /**
   * 预加载视频
   * @param url 视频URL
   * @param priority 优先级 (越大越优先)
   */
  async preload(url: string, priority: number = 0): Promise<boolean> {
    // 已缓存则直接返回
    if (this.cache.has(url) || this.state.completed.has(url)) {
      return true
    }

    // 正在加载中
    if (this.state.loading.has(url)) {
      return new Promise(resolve => {
        const listeners = this.listeners.get(url) || []
        listeners.push(status => resolve(status === 'success'))
        this.listeners.set(url, listeners)
      })
    }

    // 检查网络状态
    const networkType = await this.getNetworkType()
    if (networkType === 'none') {
      console.warn('[VideoPreloader] No network connection')
      return false
    }

    // WiFi下才预加载大文件
    if (networkType !== 'wifi' && priority < 5) {
      console.log('[VideoPreloader] Skip preload on cellular network')
      return false
    }

    // 开始预加载
    this.state.loading.add(url)

    try {
      const result = await this.downloadVideo(url)

      // 缓存管理
      this.addToCache(url, result.size, priority)

      this.state.loading.delete(url)
      this.state.completed.add(url)

      // 通知监听者
      this.notifyListeners(url, 'success')

      console.log(`[VideoPreloader] Preloaded: ${url} (${this.formatSize(result.size)})`)
      return true
    } catch (error) {
      this.state.loading.delete(url)
      this.state.failed.add(url)

      this.notifyListeners(url, 'error')

      console.error(`[VideoPreloader] Failed to preload: ${url}`, error)
      return false
    }
  }

  /**
   * 批量预加载
   * @param urls 视频URL列表
   * @param startIndex 当前播放索引
   */
  async preloadBatch(urls: string[], startIndex: number = 0): Promise<void> {
    const { preloadCount } = this.config

    // 预加载当前视频后面的N个
    const toPreload = urls
      .slice(startIndex + 1, startIndex + 1 + preloadCount)
      .map((url, idx) => ({
        url,
        priority: preloadCount - idx, // 越近优先级越高
      }))

    // 并行预加载
    await Promise.allSettled(
      toPreload.map(({ url, priority }) => this.preload(url, priority))
    )
  }

  /**
   * 检查是否已缓存
   */
  isCached(url: string): boolean {
    return this.cache.has(url) || this.state.completed.has(url)
  }

  /**
   * 获取缓存状态
   */
  getCacheStatus(): {
    count: number
    size: number
    urls: string[]
  } {
    let totalSize = 0
    const urls: string[] = []

    this.cache.forEach((item, url) => {
      totalSize += item.size
      urls.push(url)
    })

    return {
      count: this.cache.size,
      size: totalSize,
      urls,
    }
  }

  /**
   * 清理缓存
   * @param keepUrls 保留的URL列表
   */
  clearCache(keepUrls: string[] = []): void {
    const keepSet = new Set(keepUrls)

    this.cache.forEach((_, url) => {
      if (!keepSet.has(url)) {
        this.cache.delete(url)
        this.state.completed.delete(url)
      }
    })

    console.log(`[VideoPreloader] Cache cleared, kept ${keepUrls.length} items`)
  }

  /**
   * LRU淘汰策略
   */
  private evictIfNeeded(): void {
    const { maxCacheCount, maxCacheSize } = this.config

    // 按时间戳排序
    const sorted = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)

    let totalSize = 0
    sorted.forEach(([_, item]) => {
      totalSize += item.size
    })

    // 淘汰超出限制的项
    let evicted = 0
    while (
      (this.cache.size > maxCacheCount || totalSize > maxCacheSize) &&
      sorted.length > evicted
    ) {
      const [url, item] = sorted[evicted]
      this.cache.delete(url)
      this.state.completed.delete(url)
      totalSize -= item.size
      evicted++
    }

    if (evicted > 0) {
      console.log(`[VideoPreloader] Evicted ${evicted} items (LRU)`)
    }
  }

  /**
   * 添加到缓存
   */
  private addToCache(url: string, size: number, priority: number): void {
    this.cache.set(url, {
      url,
      size,
      timestamp: Date.now(),
      preloaded: true,
      priority,
    })

    this.evictIfNeeded()
  }

  /**
   * 下载视频
   */
  private downloadVideo(url: string): Promise<{ size: number }> {
    return new Promise((resolve, reject) => {
      const downloadTask = Taro.downloadFile({
        url,
        success: (res) => {
          if (res.statusCode === 200) {
            // 获取文件大小
            Taro.getFileInfo({
              filePath: res.tempFilePath,
              success: (info) => {
                resolve({ size: info.size })
              },
              fail: () => {
                resolve({ size: 0 })
              },
            })
          } else {
            reject(new Error(`HTTP ${res.statusCode}`))
          }
        },
        fail: reject,
      })

      // 超时处理
      setTimeout(() => {
        downloadTask.abort()
        reject(new Error('Download timeout'))
      }, this.config.timeout)
    })
  }

  /**
   * 获取网络类型
   */
  private async getNetworkType(): Promise<string> {
    try {
      const res = await Taro.getNetworkType()
      return res.networkType
    } catch {
      return 'unknown'
    }
  }

  /**
   * 通知监听者
   */
  private notifyListeners(url: string, status: 'success' | 'error'): void {
    const listeners = this.listeners.get(url) || []
    listeners.forEach(callback => callback(status))
    this.listeners.delete(url)
  }

  /**
   * 格式化文件大小
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }
}

// 单例
export const videoPreloader = new VideoPreloader()

// React Hook
export function useVideoPreload(urls: string[], currentIndex: number) {
  const preload = async () => {
    await videoPreloader.preloadBatch(urls, currentIndex)
  }

  return {
    preload,
    isCached: (url: string) => videoPreloader.isCached(url),
    getCacheStatus: () => videoPreloader.getCacheStatus(),
    clearCache: (keepUrls?: string[]) => videoPreloader.clearCache(keepUrls),
  }
}

export default videoPreloader
