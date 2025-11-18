/**
 * 弹幕组件
 *
 * 实现视频弹幕功能，支持：
 * 1. 滚动弹幕
 * 2. 顶部/底部固定弹幕
 * 3. 弹幕密度控制
 * 4. 轨道管理（防重叠）
 * 5. 发送弹幕
 *
 * 【核心原理】
 * 1. 轨道系统：将屏幕分成多个水平轨道，每个弹幕占用一个轨道
 * 2. 碰撞检测：计算弹幕速度，确保同一轨道的弹幕不会重叠
 * 3. 动画性能：使用 CSS transform 动画，利用 GPU 加速
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { View, Text, Input } from '@tarojs/components'
import styles from './index.module.scss'

// ==================== 类型定义 ====================

/**
 * 弹幕类型
 */
export type DanmakuType = 'scroll' | 'top' | 'bottom'

/**
 * 弹幕数据
 */
export interface DanmakuItem {
  /** 唯一ID */
  id: string
  /** 弹幕内容 */
  text: string
  /** 弹幕类型 */
  type: DanmakuType
  /** 出现时间(秒) */
  time: number
  /** 颜色 */
  color?: string
  /** 字体大小 */
  fontSize?: number
  /** 发送者 */
  userId?: string
}

/**
 * 轨道信息
 */
interface Track {
  /** 轨道索引 */
  index: number
  /** 当前轨道上最后一个弹幕的结束时间 */
  endTime: number
}

/**
 * 运行中的弹幕
 */
interface RunningDanmaku extends DanmakuItem {
  /** 分配的轨道 */
  track: number
  /** 动画时长 */
  duration: number
  /** 开始时间戳 */
  startTimestamp: number
}

/**
 * 组件Props
 */
export interface DanmakuProps {
  /** 弹幕数据 */
  data: DanmakuItem[]
  /** 当前播放时间(秒) */
  currentTime: number
  /** 是否播放中 */
  playing: boolean
  /** 是否显示弹幕 */
  visible?: boolean
  /** 弹幕透明度 (0-1) */
  opacity?: number
  /** 弹幕速度倍率 */
  speed?: number
  /** 弹幕密度 (0-1) */
  density?: number
  /** 弹幕字体大小 */
  fontSize?: number
  /** 容器宽度 */
  width: number
  /** 容器高度 */
  height: number
  /** 发送弹幕回调 */
  onSend?: (text: string, type: DanmakuType) => void
  /** 自定义类名 */
  className?: string
}

// ==================== 常量 ====================

/** 弹幕滚动基础时长(ms) */
const BASE_DURATION = 8000

/** 轨道高度 */
const TRACK_HEIGHT = 32

/** 弹幕间距 */
const DANMAKU_GAP = 20

// ==================== 组件 ====================

export function Danmaku({
  data,
  currentTime,
  playing,
  visible = true,
  opacity = 1,
  speed = 1,
  density = 1,
  fontSize = 24,
  width,
  height,
  onSend,
  className = '',
}: DanmakuProps) {
  // 运行中的弹幕
  const [runningDanmaku, setRunningDanmaku] = useState<RunningDanmaku[]>([])

  // 输入框状态
  const [inputVisible, setInputVisible] = useState(false)
  const [inputText, setInputText] = useState('')

  // 轨道管理
  const tracksRef = useRef<{
    scroll: Track[]
    top: Track[]
    bottom: Track[]
  }>({
    scroll: [],
    top: [],
    bottom: [],
  })

  // 已显示的弹幕ID
  const shownDanmakuRef = useRef<Set<string>>(new Set())

  // 上次时间
  const lastTimeRef = useRef(0)

  // ==================== 计算轨道数量 ====================

  const trackCount = useMemo(() => {
    return Math.floor(height / TRACK_HEIGHT)
  }, [height])

  // 初始化轨道
  useEffect(() => {
    tracksRef.current = {
      scroll: Array.from({ length: trackCount }, (_, i) => ({ index: i, endTime: 0 })),
      top: Array.from({ length: Math.floor(trackCount / 3) }, (_, i) => ({ index: i, endTime: 0 })),
      bottom: Array.from({ length: Math.floor(trackCount / 3) }, (_, i) => ({ index: i, endTime: 0 })),
    }
  }, [trackCount])

  // ==================== 分配轨道 ====================

  const allocateTrack = useCallback((type: DanmakuType, timestamp: number): number | null => {
    const tracks = tracksRef.current[type]

    // 根据密度过滤可用轨道
    const availableTracks = tracks.filter((_, i) => {
      return Math.random() < density
    })

    // 找到最早空闲的轨道
    let bestTrack: Track | null = null
    let minEndTime = Infinity

    for (const track of availableTracks) {
      if (track.endTime <= timestamp) {
        // 立即可用
        return track.index
      }
      if (track.endTime < minEndTime) {
        minEndTime = track.endTime
        bestTrack = track
      }
    }

    // 如果所有轨道都被占用，选择最早释放的
    return bestTrack?.index ?? null
  }, [density])

  // ==================== 处理弹幕显示 ====================

  useEffect(() => {
    if (!playing || !visible) return

    // 检测时间跳跃（seek）
    if (Math.abs(currentTime - lastTimeRef.current) > 1) {
      // 清空当前弹幕
      setRunningDanmaku([])
      shownDanmakuRef.current.clear()
      // 重置轨道
      Object.values(tracksRef.current).forEach(tracks => {
        tracks.forEach(track => track.endTime = 0)
      })
    }
    lastTimeRef.current = currentTime

    // 查找需要显示的弹幕
    const timestamp = Date.now()
    const newDanmaku: RunningDanmaku[] = []

    for (const item of data) {
      // 已显示过的跳过
      if (shownDanmakuRef.current.has(item.id)) continue

      // 时间范围检查（当前时间 ± 0.5秒）
      if (item.time >= currentTime - 0.5 && item.time <= currentTime + 0.5) {
        // 分配轨道
        const track = allocateTrack(item.type, timestamp)
        if (track === null) continue

        // 计算动画时长
        const duration = BASE_DURATION / speed

        // 更新轨道占用时间
        const tracks = tracksRef.current[item.type]
        const trackInfo = tracks.find(t => t.index === track)
        if (trackInfo) {
          if (item.type === 'scroll') {
            // 滚动弹幕：预估通过时间
            const textWidth = item.text.length * (item.fontSize || fontSize) * 0.6
            const passTime = timestamp + (textWidth / (width + textWidth)) * duration
            trackInfo.endTime = passTime + DANMAKU_GAP / speed
          } else {
            // 固定弹幕：占用完整时长
            trackInfo.endTime = timestamp + duration
          }
        }

        // 添加到运行列表
        newDanmaku.push({
          ...item,
          track,
          duration,
          startTimestamp: timestamp,
        })

        shownDanmakuRef.current.add(item.id)
      }
    }

    if (newDanmaku.length > 0) {
      setRunningDanmaku(prev => [...prev, ...newDanmaku])
    }

    // 清理已结束的弹幕
    setRunningDanmaku(prev =>
      prev.filter(d => timestamp - d.startTimestamp < d.duration)
    )
  }, [currentTime, playing, visible, data, speed, width, fontSize, allocateTrack])

  // ==================== 发送弹幕 ====================

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return

    onSend?.(inputText.trim(), 'scroll')
    setInputText('')
    setInputVisible(false)
  }, [inputText, onSend])

  // ==================== 渲染 ====================

  if (!visible) return null

  return (
    <View
      className={`${styles.container} ${className}`}
      style={{ width: `${width}px`, height: `${height}px`, opacity }}
    >
      {/* 弹幕层 */}
      <View className={styles.danmakuLayer}>
        {runningDanmaku.map(danmaku => {
          const style: React.CSSProperties = {
            fontSize: `${danmaku.fontSize || fontSize}px`,
            color: danmaku.color || '#fff',
          }

          if (danmaku.type === 'scroll') {
            // 滚动弹幕
            return (
              <View
                key={danmaku.id}
                className={styles.scrollDanmaku}
                style={{
                  ...style,
                  top: `${danmaku.track * TRACK_HEIGHT}px`,
                  animationDuration: `${danmaku.duration}ms`,
                }}
              >
                {danmaku.text}
              </View>
            )
          } else if (danmaku.type === 'top') {
            // 顶部弹幕
            return (
              <View
                key={danmaku.id}
                className={styles.topDanmaku}
                style={{
                  ...style,
                  top: `${danmaku.track * TRACK_HEIGHT}px`,
                  animationDuration: `${danmaku.duration}ms`,
                }}
              >
                {danmaku.text}
              </View>
            )
          } else {
            // 底部弹幕
            return (
              <View
                key={danmaku.id}
                className={styles.bottomDanmaku}
                style={{
                  ...style,
                  bottom: `${danmaku.track * TRACK_HEIGHT}px`,
                  animationDuration: `${danmaku.duration}ms`,
                }}
              >
                {danmaku.text}
              </View>
            )
          }
        })}
      </View>

      {/* 发送弹幕入口 */}
      {onSend && (
        <View className={styles.sendBar}>
          {inputVisible ? (
            <View className={styles.inputWrapper}>
              <Input
                className={styles.input}
                value={inputText}
                placeholder="发个弹幕..."
                placeholderStyle="color: rgba(255,255,255,0.5)"
                maxlength={50}
                onInput={(e) => setInputText(e.detail.value)}
                onConfirm={handleSend}
                focus
              />
              <Text className={styles.sendBtn} onClick={handleSend}>
                发送
              </Text>
            </View>
          ) : (
            <View
              className={styles.sendTrigger}
              onClick={() => setInputVisible(true)}
            >
              <Text>发个弹幕...</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

// ==================== Mock数据生成 ====================

/**
 * 生成测试弹幕数据
 */
export function generateMockDanmaku(count: number, duration: number): DanmakuItem[] {
  const texts = [
    '哈哈哈', '太好看了', '666', '前排', '来了来了',
    '好厉害', '学到了', '感谢分享', '太棒了', '收藏了',
    '第一次见', '不错不错', '支持', '加油', '真的吗',
  ]

  const colors = ['#fff', '#fe2c55', '#25f4ee', '#fffc00', '#ff7f00']

  return Array.from({ length: count }, (_, i) => ({
    id: `danmaku_${i}`,
    text: texts[Math.floor(Math.random() * texts.length)],
    type: Math.random() > 0.9 ? (Math.random() > 0.5 ? 'top' : 'bottom') : 'scroll',
    time: Math.random() * duration,
    color: colors[Math.floor(Math.random() * colors.length)],
    userId: `user_${Math.floor(Math.random() * 100)}`,
  }))
}

export default Danmaku
