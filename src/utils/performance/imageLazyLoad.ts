/**
 * 图片懒加载系统
 *
 * 【学习要点】
 * 1. Intersection Observer API 原理
 * 2. 占位图与渐显效果
 * 3. 错误重试机制
 * 4. 图片格式优化 (WebP)
 * 5. 响应式图片加载
 */

import Taro from '@tarojs/taro'

// 懒加载配置
export interface LazyLoadConfig {
  threshold: number // 触发阈值 (0-1)
  rootMargin: string // 提前加载距离
  placeholder: string // 占位图
  errorImage: string // 错误图
  retryCount: number // 重试次数
  retryDelay: number // 重试延迟 (ms)
  fadeIn: boolean // 渐显效果
  webpSupport: boolean // WebP支持
}

// 图片状态
export type ImageStatus = 'idle' | 'loading' | 'loaded' | 'error'

// 默认配置
const defaultConfig: LazyLoadConfig = {
  threshold: 0.1,
  rootMargin: '200px 0px',
  placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E',
  errorImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23fee" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23f66"%3E!%3C/text%3E%3C/svg%3E',
  retryCount: 2,
  retryDelay: 1000,
  fadeIn: true,
  webpSupport: true,
}

// 检测WebP支持
let webpSupported: boolean | null = null
async function checkWebPSupport(): Promise<boolean> {
  if (webpSupported !== null) return webpSupported

  try {
    const res = await Taro.getSystemInfo()
    // iOS 14+, Android 4.0+ 支持 WebP
    const isIOS = res.platform === 'ios'
    const version = parseInt(res.system?.split(' ')[1] || '0')

    webpSupported = isIOS ? version >= 14 : true
  } catch {
    webpSupported = false
  }

  return webpSupported
}

// 转换为WebP URL
export function toWebPUrl(url: string): string {
  if (!url || url.startsWith('data:')) return url

  // 已经是WebP
  if (url.includes('.webp')) return url

  // CDN URL转换 (示例，实际根据CDN配置)
  // 例如：阿里云 OSS 可以加 ?x-oss-process=image/format,webp
  if (url.includes('aliyuncs.com')) {
    return `${url}?x-oss-process=image/format,webp`
  }

  // 腾讯云 COS
  if (url.includes('myqcloud.com')) {
    return `${url}?imageMogr2/format/webp`
  }

  return url
}

// 获取响应式图片URL
export function getResponsiveUrl(
  url: string,
  width: number,
  pixelRatio: number = 2
): string {
  if (!url || url.startsWith('data:')) return url

  const targetWidth = Math.ceil(width * pixelRatio)

  // CDN缩放 (示例)
  if (url.includes('aliyuncs.com')) {
    return `${url}?x-oss-process=image/resize,w_${targetWidth}`
  }

  if (url.includes('myqcloud.com')) {
    return `${url}?imageMogr2/thumbnail/${targetWidth}x`
  }

  return url
}

/**
 * 图片懒加载管理器
 * 小程序环境使用 IntersectionObserver
 */
class ImageLazyLoadManager {
  private config: LazyLoadConfig
  private observers: Map<string, Taro.IntersectionObserver> = new Map()
  private loadingImages: Map<string, number> = new Map() // url -> retryCount

  constructor(config?: Partial<LazyLoadConfig>) {
    this.config = { ...defaultConfig, ...config }
  }

  /**
   * 创建观察器
   * @param component 页面或组件实例
   * @param selector 图片选择器
   * @param onIntersect 进入视口回调
   */
  observe(
    component: any,
    selector: string,
    onIntersect: (id: string) => void
  ): Taro.IntersectionObserver {
    const observer = Taro.createIntersectionObserver(component, {
      thresholds: [this.config.threshold],
      observeAll: true,
    })

    observer
      .relativeToViewport({
        top: parseInt(this.config.rootMargin),
        bottom: parseInt(this.config.rootMargin),
      })
      .observe(selector, (res) => {
        if (res.intersectionRatio > 0) {
          // 获取元素ID
          const id = (res as any).id || (res as any).dataset?.id
          if (id) {
            onIntersect(id)
          }
        }
      })

    this.observers.set(selector, observer)
    return observer
  }

  /**
   * 停止观察
   */
  disconnect(selector?: string): void {
    if (selector) {
      const observer = this.observers.get(selector)
      observer?.disconnect()
      this.observers.delete(selector)
    } else {
      this.observers.forEach(observer => observer.disconnect())
      this.observers.clear()
    }
  }

  /**
   * 预加载图片
   */
  async preloadImage(url: string): Promise<boolean> {
    if (!url || url.startsWith('data:')) return true

    // WebP转换
    let finalUrl = url
    if (this.config.webpSupport && await checkWebPSupport()) {
      finalUrl = toWebPUrl(url)
    }

    return new Promise((resolve) => {
      Taro.getImageInfo({
        src: finalUrl,
        success: () => resolve(true),
        fail: () => resolve(false),
      })
    })
  }

  /**
   * 带重试的图片加载
   */
  async loadWithRetry(
    url: string,
    onSuccess: (url: string) => void,
    onError: () => void
  ): Promise<void> {
    const retryCount = this.loadingImages.get(url) || 0

    // WebP转换
    let finalUrl = url
    if (this.config.webpSupport && await checkWebPSupport()) {
      finalUrl = toWebPUrl(url)
    }

    try {
      await Taro.getImageInfo({ src: finalUrl })
      this.loadingImages.delete(url)
      onSuccess(finalUrl)
    } catch (error) {
      if (retryCount < this.config.retryCount) {
        // 重试
        this.loadingImages.set(url, retryCount + 1)
        setTimeout(() => {
          this.loadWithRetry(url, onSuccess, onError)
        }, this.config.retryDelay * (retryCount + 1))
      } else {
        // 重试失败
        this.loadingImages.delete(url)
        onError()
      }
    }
  }

  /**
   * 获取占位图
   */
  getPlaceholder(): string {
    return this.config.placeholder
  }

  /**
   * 获取错误图
   */
  getErrorImage(): string {
    return this.config.errorImage
  }

  /**
   * 是否启用渐显
   */
  isFadeInEnabled(): boolean {
    return this.config.fadeIn
  }
}

// 单例
export const imageLazyLoadManager = new ImageLazyLoadManager()

export default imageLazyLoadManager
