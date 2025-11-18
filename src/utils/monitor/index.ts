/**
 * 性能监控SDK
 *
 * 企业级前端监控系统，用于收集和上报性能指标、错误信息、用户行为
 *
 * 【核心功能】
 * 1. 错误捕获和上报（JS错误、Promise错误、资源加载错误）
 * 2. 性能指标采集（FPS、内存、页面加载时间）
 * 3. 用户行为追踪（页面访问、点击事件）
 * 4. 自定义埋点
 * 5. 数据聚合和批量上报
 *
 * 【设计原则】
 * - 低侵入性：不影响业务代码
 * - 高性能：异步上报，批量处理
 * - 可扩展：插件化架构
 */

import Taro from '@tarojs/taro'

// ==================== 类型定义 ====================

/**
 * 监控配置
 */
export interface MonitorConfig {
  /** 应用ID */
  appId: string
  /** 上报地址 */
  reportUrl: string
  /** 是否启用 */
  enabled: boolean
  /** 采样率 (0-1) */
  sampleRate: number
  /** 批量上报的最大条数 */
  maxBatchSize: number
  /** 上报间隔(ms) */
  reportInterval: number
  /** 是否上报性能数据 */
  enablePerformance: boolean
  /** 是否上报错误 */
  enableError: boolean
  /** 是否上报用户行为 */
  enableBehavior: boolean
  /** 是否打印日志 */
  debug: boolean
}

/**
 * 监控数据类型
 */
export type MonitorDataType =
  | 'error'       // 错误
  | 'performance' // 性能
  | 'behavior'    // 行为
  | 'custom'      // 自定义

/**
 * 错误类型
 */
export type ErrorType =
  | 'js'          // JS运行错误
  | 'promise'     // Promise未捕获错误
  | 'resource'    // 资源加载错误
  | 'api'         // API请求错误
  | 'custom'      // 自定义错误

/**
 * 错误数据
 */
export interface ErrorData {
  type: ErrorType
  message: string
  stack?: string
  filename?: string
  lineno?: number
  colno?: number
  /** 错误发生时的页面 */
  page: string
  /** 额外信息 */
  extra?: Record<string, any>
}

/**
 * 性能数据
 */
export interface PerformanceData {
  /** 页面路径 */
  page: string
  /** 页面加载时间 */
  loadTime?: number
  /** 首次内容绘制 */
  fcp?: number
  /** 最大内容绘制 */
  lcp?: number
  /** 首次输入延迟 */
  fid?: number
  /** 累计布局偏移 */
  cls?: number
  /** 当前FPS */
  fps?: number
  /** 内存使用 */
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
  }
  /** 自定义指标 */
  custom?: Record<string, number>
}

/**
 * 用户行为数据
 */
export interface BehaviorData {
  /** 行为类型 */
  type: 'pageview' | 'click' | 'scroll' | 'input' | 'custom'
  /** 页面路径 */
  page: string
  /** 元素信息 */
  element?: {
    tagName: string
    id?: string
    className?: string
    text?: string
  }
  /** 额外数据 */
  extra?: Record<string, any>
}

/**
 * 自定义埋点数据
 */
export interface CustomData {
  /** 事件名 */
  event: string
  /** 事件数据 */
  data: Record<string, any>
}

/**
 * 上报数据
 */
export interface ReportData {
  /** 数据类型 */
  type: MonitorDataType
  /** 时间戳 */
  timestamp: number
  /** 应用ID */
  appId: string
  /** 用户ID */
  userId?: string
  /** 设备ID */
  deviceId: string
  /** 页面路径 */
  page: string
  /** 数据内容 */
  data: ErrorData | PerformanceData | BehaviorData | CustomData
  /** SDK版本 */
  sdkVersion: string
  /** 系统信息 */
  systemInfo: {
    platform: string
    system: string
    brand: string
    model: string
    version: string
  }
}

// ==================== 监控类 ====================

/**
 * 性能监控SDK主类
 */
class PerformanceMonitor {
  private config: MonitorConfig
  private reportQueue: ReportData[] = []
  private reportTimer: NodeJS.Timeout | null = null
  private systemInfo: any = {}
  private deviceId: string = ''
  private userId: string = ''
  private isInitialized: boolean = false

  // FPS监控
  private fpsFrames: number[] = []
  private lastFrameTime: number = 0

  // 性能标记
  private marks: Map<string, number> = new Map()

  constructor() {
    // 默认配置
    this.config = {
      appId: '',
      reportUrl: '',
      enabled: true,
      sampleRate: 1,
      maxBatchSize: 10,
      reportInterval: 5000,
      enablePerformance: true,
      enableError: true,
      enableBehavior: true,
      debug: false,
    }
  }

  /**
   * 初始化监控SDK
   */
  init(config: Partial<MonitorConfig>): void {
    if (this.isInitialized) {
      this.log('Monitor already initialized')
      return
    }

    // 合并配置
    this.config = { ...this.config, ...config }

    // 获取系统信息
    try {
      this.systemInfo = Taro.getSystemInfoSync()
      this.deviceId = this.generateDeviceId()
    } catch (e) {
      this.log('Failed to get system info:', e)
    }

    // 初始化错误监听
    if (this.config.enableError) {
      this.initErrorListener()
    }

    // 启动上报定时器
    this.startReportTimer()

    this.isInitialized = true
    this.log('Monitor initialized:', this.config)
  }

  /**
   * 设置用户ID
   */
  setUserId(userId: string): void {
    this.userId = userId
  }

  /**
   * 初始化错误监听
   */
  private initErrorListener(): void {
    // 监听全局错误
    Taro.onError((error) => {
      this.captureError({
        type: 'js',
        message: error,
        page: this.getCurrentPage(),
      })
    })

    // 监听未处理的Promise错误
    Taro.onUnhandledRejection?.((res) => {
      this.captureError({
        type: 'promise',
        message: res.reason?.message || String(res.reason),
        stack: res.reason?.stack,
        page: this.getCurrentPage(),
      })
    })
  }

  /**
   * 捕获错误
   */
  captureError(error: ErrorData): void {
    if (!this.config.enabled || !this.config.enableError) return

    this.addToQueue('error', error)
    this.log('Error captured:', error)
  }

  /**
   * 上报性能数据
   */
  reportPerformance(data: Partial<PerformanceData>): void {
    if (!this.config.enabled || !this.config.enablePerformance) return

    const perfData: PerformanceData = {
      page: this.getCurrentPage(),
      ...data,
    }

    this.addToQueue('performance', perfData)
    this.log('Performance reported:', perfData)
  }

  /**
   * 上报用户行为
   */
  reportBehavior(data: BehaviorData): void {
    if (!this.config.enabled || !this.config.enableBehavior) return

    this.addToQueue('behavior', data)
    this.log('Behavior reported:', data)
  }

  /**
   * 自定义埋点
   */
  track(event: string, data: Record<string, any> = {}): void {
    if (!this.config.enabled) return

    const customData: CustomData = {
      event,
      data,
    }

    this.addToQueue('custom', customData)
    this.log('Custom event tracked:', customData)
  }

  /**
   * 性能标记开始
   */
  markStart(name: string): void {
    this.marks.set(name, Date.now())
  }

  /**
   * 性能标记结束并上报
   */
  markEnd(name: string): number {
    const startTime = this.marks.get(name)
    if (!startTime) {
      this.log(`Mark "${name}" not found`)
      return 0
    }

    const duration = Date.now() - startTime
    this.marks.delete(name)

    this.reportPerformance({
      custom: { [name]: duration },
    })

    return duration
  }

  /**
   * 页面访问统计
   */
  pageView(page?: string): void {
    this.reportBehavior({
      type: 'pageview',
      page: page || this.getCurrentPage(),
    })
  }

  /**
   * API请求监控
   */
  reportApiError(url: string, error: any, duration?: number): void {
    this.captureError({
      type: 'api',
      message: error.message || String(error),
      page: this.getCurrentPage(),
      extra: {
        url,
        duration,
        status: error.statusCode,
      },
    })
  }

  /**
   * 添加到上报队列
   */
  private addToQueue(type: MonitorDataType, data: any): void {
    // 采样率检查
    if (Math.random() > this.config.sampleRate) return

    const reportData: ReportData = {
      type,
      timestamp: Date.now(),
      appId: this.config.appId,
      userId: this.userId,
      deviceId: this.deviceId,
      page: this.getCurrentPage(),
      data,
      sdkVersion: '1.0.0',
      systemInfo: {
        platform: this.systemInfo.platform || '',
        system: this.systemInfo.system || '',
        brand: this.systemInfo.brand || '',
        model: this.systemInfo.model || '',
        version: this.systemInfo.version || '',
      },
    }

    this.reportQueue.push(reportData)

    // 达到最大批量数时立即上报
    if (this.reportQueue.length >= this.config.maxBatchSize) {
      this.flush()
    }
  }

  /**
   * 启动上报定时器
   */
  private startReportTimer(): void {
    if (this.reportTimer) return

    this.reportTimer = setInterval(() => {
      this.flush()
    }, this.config.reportInterval)
  }

  /**
   * 立即上报所有数据
   */
  flush(): void {
    if (this.reportQueue.length === 0) return

    const dataToReport = [...this.reportQueue]
    this.reportQueue = []

    this.sendReport(dataToReport)
  }

  /**
   * 发送上报请求
   */
  private async sendReport(data: ReportData[]): Promise<void> {
    if (!this.config.reportUrl) {
      this.log('Report URL not configured')
      return
    }

    try {
      // 使用 sendBeacon 或 request
      await Taro.request({
        url: this.config.reportUrl,
        method: 'POST',
        data: {
          data,
        },
        header: {
          'Content-Type': 'application/json',
        },
      })

      this.log('Report sent:', data.length, 'items')
    } catch (error) {
      this.log('Report failed:', error)
      // 失败的数据放回队列
      this.reportQueue.unshift(...data)
    }
  }

  /**
   * 获取当前页面路径
   */
  private getCurrentPage(): string {
    try {
      const pages = Taro.getCurrentPages()
      const currentPage = pages[pages.length - 1]
      return currentPage?.route || ''
    } catch (e) {
      return ''
    }
  }

  /**
   * 生成设备ID
   */
  private generateDeviceId(): string {
    const stored = Taro.getStorageSync('monitor_device_id')
    if (stored) return stored

    const id = `${Date.now()}_${Math.random().toString(36).substring(2)}`
    Taro.setStorageSync('monitor_device_id', id)
    return id
  }

  /**
   * 调试日志
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[Monitor]', ...args)
    }
  }

  /**
   * 销毁监控
   */
  destroy(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = null
    }
    this.flush()
    this.isInitialized = false
  }
}

// ==================== 导出单例 ====================

export const monitor = new PerformanceMonitor()

/**
 * 快捷方法
 */
export const initMonitor = (config: Partial<MonitorConfig>) => monitor.init(config)
export const setUserId = (userId: string) => monitor.setUserId(userId)
export const captureError = (error: ErrorData) => monitor.captureError(error)
export const reportPerformance = (data: Partial<PerformanceData>) => monitor.reportPerformance(data)
export const reportBehavior = (data: BehaviorData) => monitor.reportBehavior(data)
export const track = (event: string, data?: Record<string, any>) => monitor.track(event, data)
export const markStart = (name: string) => monitor.markStart(name)
export const markEnd = (name: string) => monitor.markEnd(name)
export const pageView = (page?: string) => monitor.pageView(page)

export default monitor
