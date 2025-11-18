/**
 * 视频上传组件
 *
 * 企业级视频上传系统，支持：
 * 1. 大文件分片上传
 * 2. 断点续传
 * 3. 上传进度追踪
 * 4. 并发控制
 * 5. 封面截取
 *
 * 【核心原理】
 * - 将大文件切成小片段（chunks）
 * - 并发上传多个片段
 * - 服务端合并片段
 * - 支持暂停/继续
 */

import { useState, useRef, useCallback } from 'react'
import { View, Text, Progress } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

// ==================== 类型定义 ====================

/**
 * 上传状态
 */
export type UploadStatus =
  | 'idle'        // 空闲
  | 'selecting'   // 选择中
  | 'preparing'   // 准备中（计算MD5等）
  | 'uploading'   // 上传中
  | 'paused'      // 暂停
  | 'merging'     // 合并中
  | 'success'     // 成功
  | 'error'       // 失败

/**
 * 分片信息
 */
export interface ChunkInfo {
  index: number
  start: number
  end: number
  size: number
  uploaded: boolean
  retries: number
}

/**
 * 上传配置
 */
export interface UploadConfig {
  /** 上传地址 */
  uploadUrl: string
  /** 合并地址 */
  mergeUrl: string
  /** 分片大小(bytes)，默认2MB */
  chunkSize?: number
  /** 并发数 */
  concurrency?: number
  /** 重试次数 */
  maxRetries?: number
  /** 允许的视频格式 */
  accept?: string[]
  /** 最大文件大小(bytes) */
  maxSize?: number
  /** 最大时长(秒) */
  maxDuration?: number
}

/**
 * 上传结果
 */
export interface UploadResult {
  /** 视频URL */
  videoUrl: string
  /** 封面URL */
  coverUrl?: string
  /** 视频时长 */
  duration: number
  /** 文件大小 */
  size: number
  /** 文件名 */
  filename: string
}

/**
 * 组件Props
 */
export interface VideoUploadProps {
  /** 上传配置 */
  config: UploadConfig
  /** 上传成功回调 */
  onSuccess?: (result: UploadResult) => void
  /** 上传失败回调 */
  onError?: (error: Error) => void
  /** 进度变化回调 */
  onProgress?: (progress: number) => void
  /** 自定义类名 */
  className?: string
}

// ==================== 工具函数 ====================

/**
 * 计算文件MD5（简化版，实际应使用spark-md5）
 */
async function calculateMD5(filePath: string): Promise<string> {
  // 实际项目中使用 spark-md5 库计算
  // 这里简化为使用文件路径+大小+时间戳
  return `${Date.now()}_${Math.random().toString(36).substring(2)}`
}

/**
 * 获取视频信息
 */
async function getVideoInfo(filePath: string): Promise<{
  duration: number
  size: number
  width: number
  height: number
}> {
  return new Promise((resolve, reject) => {
    Taro.getVideoInfo({
      src: filePath,
      success: (res) => {
        resolve({
          duration: res.duration,
          size: res.size,
          width: res.width,
          height: res.height,
        })
      },
      fail: reject,
    })
  })
}

// ==================== 上传管理器 ====================

/**
 * 分片上传管理器
 */
class ChunkUploader {
  private config: Required<UploadConfig>
  private fileInfo: {
    path: string
    size: number
    name: string
    md5: string
  } | null = null
  private chunks: ChunkInfo[] = []
  private uploadedChunks: Set<number> = new Set()
  private status: UploadStatus = 'idle'
  private progress: number = 0
  private abortControllers: Map<number, any> = new Map()

  // 回调
  private onProgressCallback?: (progress: number) => void
  private onStatusChange?: (status: UploadStatus) => void

  constructor(config: UploadConfig) {
    this.config = {
      uploadUrl: config.uploadUrl,
      mergeUrl: config.mergeUrl,
      chunkSize: config.chunkSize || 2 * 1024 * 1024, // 2MB
      concurrency: config.concurrency || 3,
      maxRetries: config.maxRetries || 3,
      accept: config.accept || ['mp4', 'mov', 'avi'],
      maxSize: config.maxSize || 500 * 1024 * 1024, // 500MB
      maxDuration: config.maxDuration || 300, // 5分钟
    }
  }

  /**
   * 设置回调
   */
  setCallbacks(
    onProgress?: (progress: number) => void,
    onStatusChange?: (status: UploadStatus) => void
  ) {
    this.onProgressCallback = onProgress
    this.onStatusChange = onStatusChange
  }

  /**
   * 选择视频
   */
  async selectVideo(): Promise<void> {
    this.setStatus('selecting')

    try {
      const res = await Taro.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: this.config.maxDuration,
        compressed: false,
      })

      // 验证文件
      const videoInfo = await getVideoInfo(res.tempFilePath)

      if (videoInfo.size > this.config.maxSize) {
        throw new Error(`视频大小超过限制(${this.config.maxSize / 1024 / 1024}MB)`)
      }

      if (videoInfo.duration > this.config.maxDuration) {
        throw new Error(`视频时长超过限制(${this.config.maxDuration}秒)`)
      }

      // 保存文件信息
      this.fileInfo = {
        path: res.tempFilePath,
        size: videoInfo.size,
        name: `video_${Date.now()}.mp4`,
        md5: '',
      }

      this.setStatus('idle')
    } catch (error) {
      this.setStatus('error')
      throw error
    }
  }

  /**
   * 开始上传
   */
  async start(): Promise<UploadResult> {
    if (!this.fileInfo) {
      throw new Error('请先选择视频')
    }

    try {
      // 准备阶段：计算MD5，生成分片
      this.setStatus('preparing')
      this.fileInfo.md5 = await calculateMD5(this.fileInfo.path)
      this.createChunks()

      // 检查已上传的分片（断点续传）
      await this.checkUploadedChunks()

      // 开始上传
      this.setStatus('uploading')
      await this.uploadChunks()

      // 合并分片
      this.setStatus('merging')
      const result = await this.mergeChunks()

      this.setStatus('success')
      return result
    } catch (error) {
      this.setStatus('error')
      throw error
    }
  }

  /**
   * 暂停上传
   */
  pause(): void {
    if (this.status !== 'uploading') return

    this.setStatus('paused')

    // 取消所有进行中的请求
    this.abortControllers.forEach((controller) => {
      controller.abort?.()
    })
    this.abortControllers.clear()
  }

  /**
   * 继续上传
   */
  async resume(): Promise<void> {
    if (this.status !== 'paused') return

    this.setStatus('uploading')
    await this.uploadChunks()
  }

  /**
   * 创建分片
   */
  private createChunks(): void {
    if (!this.fileInfo) return

    const { size } = this.fileInfo
    const { chunkSize } = this.config

    this.chunks = []
    let index = 0
    let start = 0

    while (start < size) {
      const end = Math.min(start + chunkSize, size)
      this.chunks.push({
        index,
        start,
        end,
        size: end - start,
        uploaded: false,
        retries: 0,
      })
      start = end
      index++
    }
  }

  /**
   * 检查已上传的分片（断点续传）
   */
  private async checkUploadedChunks(): Promise<void> {
    // 实际项目中调用服务端接口查询
    // 这里简化处理
    this.uploadedChunks.clear()
  }

  /**
   * 上传分片
   */
  private async uploadChunks(): Promise<void> {
    const pendingChunks = this.chunks.filter(
      (chunk) => !chunk.uploaded && !this.uploadedChunks.has(chunk.index)
    )

    // 并发控制
    const { concurrency } = this.config
    let currentIndex = 0

    const uploadNext = async (): Promise<void> => {
      while (currentIndex < pendingChunks.length && this.status === 'uploading') {
        const chunk = pendingChunks[currentIndex++]
        try {
          await this.uploadChunk(chunk)
          chunk.uploaded = true
          this.uploadedChunks.add(chunk.index)
          this.updateProgress()
        } catch (error) {
          if (chunk.retries < this.config.maxRetries) {
            chunk.retries++
            currentIndex-- // 重试
          } else {
            throw error
          }
        }
      }
    }

    // 启动并发上传
    const workers = Array(concurrency).fill(null).map(() => uploadNext())
    await Promise.all(workers)
  }

  /**
   * 上传单个分片
   */
  private async uploadChunk(chunk: ChunkInfo): Promise<void> {
    if (!this.fileInfo) return

    // 实际项目中使用 FileSystemManager.readFile 读取分片数据
    // 这里简化为模拟上传

    return new Promise((resolve, reject) => {
      // 模拟上传延迟
      const timer = setTimeout(() => {
        if (Math.random() > 0.05) { // 95%成功率
          resolve()
        } else {
          reject(new Error('Upload failed'))
        }
      }, 100 + Math.random() * 200)

      // 保存取消方法
      this.abortControllers.set(chunk.index, {
        abort: () => {
          clearTimeout(timer)
          reject(new Error('Aborted'))
        },
      })
    })
  }

  /**
   * 合并分片
   */
  private async mergeChunks(): Promise<UploadResult> {
    if (!this.fileInfo) {
      throw new Error('File info not found')
    }

    // 实际项目中调用服务端合并接口
    // 这里返回模拟结果

    return {
      videoUrl: `https://example.com/videos/${this.fileInfo.md5}.mp4`,
      coverUrl: `https://example.com/covers/${this.fileInfo.md5}.jpg`,
      duration: 30,
      size: this.fileInfo.size,
      filename: this.fileInfo.name,
    }
  }

  /**
   * 更新进度
   */
  private updateProgress(): void {
    const uploaded = this.uploadedChunks.size
    const total = this.chunks.length
    this.progress = Math.floor((uploaded / total) * 100)
    this.onProgressCallback?.(this.progress)
  }

  /**
   * 设置状态
   */
  private setStatus(status: UploadStatus): void {
    this.status = status
    this.onStatusChange?.(status)
  }

  /**
   * 获取当前状态
   */
  getStatus(): UploadStatus {
    return this.status
  }

  /**
   * 获取进度
   */
  getProgress(): number {
    return this.progress
  }

  /**
   * 重置
   */
  reset(): void {
    this.fileInfo = null
    this.chunks = []
    this.uploadedChunks.clear()
    this.progress = 0
    this.setStatus('idle')
  }
}

// ==================== 组件 ====================

/**
 * 视频上传组件
 */
export function VideoUpload({
  config,
  onSuccess,
  onError,
  onProgress,
  className = '',
}: VideoUploadProps) {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const uploaderRef = useRef<ChunkUploader | null>(null)

  // 初始化上传器
  if (!uploaderRef.current) {
    uploaderRef.current = new ChunkUploader(config)
    uploaderRef.current.setCallbacks(
      (p) => {
        setProgress(p)
        onProgress?.(p)
      },
      setStatus
    )
  }

  /**
   * 选择并上传
   */
  const handleSelect = useCallback(async () => {
    const uploader = uploaderRef.current
    if (!uploader) return

    try {
      setErrorMsg('')
      await uploader.selectVideo()
      const result = await uploader.start()
      onSuccess?.(result)
    } catch (error: any) {
      setErrorMsg(error.message)
      onError?.(error)
    }
  }, [onSuccess, onError])

  /**
   * 暂停
   */
  const handlePause = useCallback(() => {
    uploaderRef.current?.pause()
  }, [])

  /**
   * 继续
   */
  const handleResume = useCallback(async () => {
    try {
      await uploaderRef.current?.resume()
    } catch (error: any) {
      setErrorMsg(error.message)
      onError?.(error)
    }
  }, [onError])

  /**
   * 重试
   */
  const handleRetry = useCallback(() => {
    uploaderRef.current?.reset()
    setProgress(0)
    setErrorMsg('')
    handleSelect()
  }, [handleSelect])

  return (
    <View className={`${styles.container} ${className}`}>
      {/* 选择按钮 */}
      {status === 'idle' && (
        <View className={styles.selectBtn} onClick={handleSelect}>
          <View className={styles.plusIcon}>+</View>
          <Text className={styles.selectText}>选择视频</Text>
        </View>
      )}

      {/* 上传进度 */}
      {(status === 'uploading' || status === 'paused') && (
        <View className={styles.progressSection}>
          <Progress
            percent={progress}
            strokeWidth={4}
            activeColor="#fe2c55"
            backgroundColor="rgba(255,255,255,0.1)"
          />
          <Text className={styles.progressText}>{progress}%</Text>

          <View className={styles.actions}>
            {status === 'uploading' ? (
              <View className={styles.pauseBtn} onClick={handlePause}>
                暂停
              </View>
            ) : (
              <View className={styles.resumeBtn} onClick={handleResume}>
                继续
              </View>
            )}
          </View>
        </View>
      )}

      {/* 准备中/合并中 */}
      {(status === 'preparing' || status === 'merging') && (
        <View className={styles.loading}>
          <View className={styles.spinner} />
          <Text>{status === 'preparing' ? '准备中...' : '处理中...'}</Text>
        </View>
      )}

      {/* 成功 */}
      {status === 'success' && (
        <View className={styles.success}>
          <View className={styles.checkIcon}>✓</View>
          <Text>上传成功</Text>
        </View>
      )}

      {/* 错误 */}
      {status === 'error' && (
        <View className={styles.error}>
          <Text className={styles.errorText}>{errorMsg || '上传失败'}</Text>
          <View className={styles.retryBtn} onClick={handleRetry}>
            重试
          </View>
        </View>
      )}
    </View>
  )
}

export default VideoUpload
