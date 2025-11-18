/**
 * 图片 CDN 优化工具
 *
 * 【学习要点】为什么图片要走 CDN？
 *
 * 1. 减小包体积 - 图片不打包进小程序
 * 2. 按需加载 - 用户看到时才加载
 * 3. 格式转换 - 自动转 WebP 减小 30%
 * 4. 尺寸适配 - 根据屏幕大小裁剪
 *
 * 常用 CDN 服务商：
 * - 阿里云 OSS
 * - 腾讯云 COS
 * - 七牛云
 * - 又拍云
 */

import Taro from '@tarojs/taro'

/**
 * 【学习要点】CDN 配置
 *
 * 不同 CDN 服务商的参数格式不同
 * 这里以阿里云 OSS 为例
 */
interface CdnConfig {
  /** CDN 域名 */
  domain: string
  /** 图片处理参数前缀 */
  processPrefix: string
  /** 是否启用 WebP */
  enableWebP: boolean
  /** 默认质量 */
  defaultQuality: number
}

// 默认配置（阿里云 OSS 格式）
const defaultConfig: CdnConfig = {
  domain: 'https://your-bucket.oss-cn-hangzhou.aliyuncs.com',
  processPrefix: 'x-oss-process=image',
  enableWebP: true,
  defaultQuality: 80
}

let config = { ...defaultConfig }

/**
 * 初始化 CDN 配置
 *
 * @example
 * ```ts
 * initCdnConfig({
 *   domain: 'https://cdn.example.com',
 *   enableWebP: true
 * })
 * ```
 */
export function initCdnConfig(customConfig: Partial<CdnConfig>): void {
  config = { ...config, ...customConfig }
}

/**
 * 【学习要点】检测 WebP 支持
 *
 * iOS 14+、Android 4.2+ 支持 WebP
 * 小程序基础库 2.9.0+ 支持 WebP
 */
export function isWebPSupported(): boolean {
  const systemInfo = Taro.getSystemInfoSync()
  const { platform, system } = systemInfo

  if (platform === 'ios') {
    // iOS 14+ 支持 WebP
    const version = parseInt(system.split(' ')[1] || '0')
    return version >= 14
  } else if (platform === 'android') {
    // Android 4.2+ 支持 WebP
    return true
  }

  return true
}

/**
 * 【学习要点】获取设备像素比
 *
 * 不同设备屏幕密度不同：
 * - 普通屏幕：1x
 * - Retina：2x
 * - 超清屏：3x
 *
 * 根据像素比请求合适尺寸的图片
 * 避免加载过大或过小的图片
 */
export function getPixelRatio(): number {
  const systemInfo = Taro.getSystemInfoSync()
  return Math.min(systemInfo.pixelRatio || 2, 3) // 最高 3x
}

/**
 * 【学习要点】生成 CDN 优化 URL
 *
 * 核心优化策略：
 * 1. 尺寸裁剪 - 只加载需要的尺寸
 * 2. 格式转换 - 自动转 WebP
 * 3. 质量压缩 - 降低质量节省流量
 *
 * @param url - 原始图片 URL
 * @param options - 优化选项
 *
 * @example
 * ```ts
 * // 基础用法
 * const url = getCdnUrl('https://cdn.com/image.jpg', { width: 200 })
 *
 * // 完整选项
 * const url = getCdnUrl('https://cdn.com/image.jpg', {
 *   width: 200,
 *   height: 200,
 *   quality: 80,
 *   format: 'webp',
 *   mode: 'fill'  // 裁剪模式
 * })
 * ```
 */
export function getCdnUrl(
  url: string,
  options: {
    /** 目标宽度 (rpx) */
    width?: number
    /** 目标高度 (rpx) */
    height?: number
    /** 图片质量 1-100 */
    quality?: number
    /** 输出格式 */
    format?: 'jpg' | 'png' | 'webp' | 'gif'
    /** 裁剪模式 */
    mode?: 'lfit' | 'mfit' | 'fill' | 'pad' | 'fixed'
  } = {}
): string {
  // 如果不是 CDN 域名，直接返回
  if (!url || !url.startsWith('http')) {
    return url
  }

  const pixelRatio = getPixelRatio()
  const params: string[] = []

  // 1. 尺寸处理
  if (options.width || options.height) {
    /**
     * 【学习要点】rpx 到 px 的转换
     *
     * 设计稿 750rpx = 设备宽度
     * 实际 px = rpx / 750 * 屏幕宽度 * 像素比
     *
     * 这样可以获得适合设备的实际像素尺寸
     */
    const systemInfo = Taro.getSystemInfoSync()
    const ratio = systemInfo.windowWidth / 750

    if (options.width) {
      const realWidth = Math.round(options.width * ratio * pixelRatio)
      params.push(`resize,w_${realWidth}`)
    }

    if (options.height) {
      const realHeight = Math.round(options.height * ratio * pixelRatio)
      params.push(`h_${realHeight}`)
    }

    // 裁剪模式
    if (options.mode) {
      params.push(`m_${options.mode}`)
    }
  }

  // 2. 格式转换
  /**
   * 【学习要点】WebP 格式优势
   *
   * - 同等质量下，体积比 JPG 小 25-34%
   * - 支持透明通道（类似 PNG）
   * - 支持动画（类似 GIF）
   */
  let format = options.format
  if (!format && config.enableWebP && isWebPSupported()) {
    format = 'webp'
  }
  if (format) {
    params.push(`format,${format}`)
  }

  // 3. 质量压缩
  const quality = options.quality || config.defaultQuality
  params.push(`quality,q_${quality}`)

  // 生成最终 URL
  if (params.length === 0) {
    return url
  }

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${config.processPrefix}/${params.join('/')}`
}

/**
 * 【学习要点】生成响应式图片 srcset
 *
 * 提供多个尺寸，让浏览器/小程序选择最合适的
 * 节省流量，提升加载速度
 *
 * @example
 * ```ts
 * const srcset = getResponsiveSrcSet('https://cdn.com/image.jpg', {
 *   baseWidth: 200,
 *   sizes: [1, 2, 3]  // 1x, 2x, 3x
 * })
 * // 返回: "url@1x 200w, url@2x 400w, url@3x 600w"
 * ```
 */
export function getResponsiveSrcSet(
  url: string,
  options: {
    baseWidth: number
    sizes?: number[]
    quality?: number
  }
): string {
  const { baseWidth, sizes = [1, 2, 3], quality } = options

  return sizes
    .map(size => {
      const width = baseWidth * size
      const optimizedUrl = getCdnUrl(url, { width, quality })
      return `${optimizedUrl} ${width}w`
    })
    .join(', ')
}

/**
 * 【学习要点】预加载关键图片
 *
 * 提前加载重要图片（如首屏大图）
 * 提升用户感知性能
 */
export async function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    Taro.getImageInfo({
      src: url,
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

/**
 * 【学习要点】批量预加载
 *
 * 预加载多张图片，使用 Promise.allSettled
 * 即使部分失败也不影响其他图片
 */
export async function preloadImages(urls: string[]): Promise<boolean[]> {
  const results = await Promise.allSettled(
    urls.map(url => preloadImage(url))
  )

  return results.map(result =>
    result.status === 'fulfilled' ? result.value : false
  )
}

/**
 * 【学习要点】获取图片占位符
 *
 * 使用极小的 base64 图片作为占位
 * 避免布局抖动，提升用户体验
 */
export function getPlaceholder(
  width: number = 1,
  height: number = 1,
  color: string = '#f0f0f0'
): string {
  /**
   * 这是一个 1x1 像素的灰色 GIF
   * 大小只有 43 字节
   * 可以用于图片加载前的占位
   */
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='${encodeURIComponent(color)}' width='${width}' height='${height}'/%3E%3C/svg%3E`
}

/**
 * 【学习要点】计算图片宽高比
 *
 * 用于实现等比例缩放的占位容器
 * 避免图片加载时的布局抖动
 */
export function getAspectRatioPadding(width: number, height: number): string {
  return `${(height / width * 100).toFixed(2)}%`
}

// 导出默认实例方便使用
export default {
  init: initCdnConfig,
  getUrl: getCdnUrl,
  getSrcSet: getResponsiveSrcSet,
  preload: preloadImage,
  preloadBatch: preloadImages,
  getPlaceholder,
  getAspectRatioPadding,
  isWebPSupported,
  getPixelRatio
}
