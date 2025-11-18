/**
 * 直播服务
 *
 * 企业级直播功能实现，包含：
 * 1. 直播间管理（创建/加入/离开）
 * 2. 实时消息（弹幕/礼物/系统消息）
 * 3. 观众管理
 * 4. 直播数据统计
 *
 * 【技术架构】
 * - 使用 WebSocket 进行实时通讯
 * - 心跳保活机制
 * - 断线重连策略
 * - 消息队列管理
 */

import Taro from '@tarojs/taro'

// ==================== 类型定义 ====================

/**
 * 直播间状态
 */
export type LiveStatus = 'idle' | 'preparing' | 'living' | 'ended' | 'banned'

/**
 * 消息类型
 */
export type MessageType =
  | 'join'     // 加入直播间
  | 'leave'   // 离开直播间
  | 'chat'    // 聊天消息
  | 'gift'    // 礼物
  | 'like'    // 点赞
  | 'follow'  // 关注
  | 'system'  // 系统消息
  | 'ban'     // 禁言

/**
 * 直播间信息
 */
export interface LiveRoom {
  id: string
  title: string
  coverUrl: string
  anchorId: string
  anchorName: string
  anchorAvatar: string
  status: LiveStatus
  viewerCount: number
  likeCount: number
  startTime?: string
  pushUrl?: string  // 推流地址（主播端）
  pullUrl?: string  // 拉流地址（观众端）
}

/**
 * 直播消息
 */
export interface LiveMessage {
  id: string
  type: MessageType
  userId: string
  userName: string
  userAvatar: string
  content: string
  giftId?: string
  giftCount?: number
  timestamp: number
}

/**
 * 礼物
 */
export interface Gift {
  id: string
  name: string
  icon: string
  price: number
  animation?: string
}

/**
 * WebSocket 配置
 */
export interface WSConfig {
  url: string
  heartbeatInterval?: number
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

// ==================== WebSocket 管理器 ====================

/**
 * WebSocket 连接管理器
 *
 * 【核心功能】
 * 1. 自动重连
 * 2. 心跳保活
 * 3. 消息队列
 * 4. 事件订阅
 */
class WebSocketManager {
  private socket: Taro.SocketTask | null = null
  private config: Required<WSConfig>
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private messageQueue: any[] = []
  private listeners: Map<string, Set<Function>> = new Map()

  constructor(config: WSConfig) {
    this.config = {
      url: config.url,
      heartbeatInterval: config.heartbeatInterval || 30000,
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
    }
  }

  /**
   * 连接 WebSocket
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.close()
      }

      try {
        this.socket = Taro.connectSocket({
          url: this.config.url,
          success: () => {
            console.log('[WS] Connecting...')
          },
        })

        this.socket.onOpen(() => {
          console.log('[WS] Connected')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.flushMessageQueue()
          this.emit('open')
          resolve()
        })

        this.socket.onMessage((res) => {
          try {
            const data = JSON.parse(res.data as string)
            this.emit('message', data)
          } catch (e) {
            console.error('[WS] Parse message error:', e)
          }
        })

        this.socket.onError((error) => {
          console.error('[WS] Error:', error)
          this.emit('error', error)
          reject(error)
        })

        this.socket.onClose((res) => {
          console.log('[WS] Closed:', res.code, res.reason)
          this.isConnected = false
          this.stopHeartbeat()
          this.emit('close', res)

          // 自动重连
          if (res.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.reconnect()
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 发送消息
   */
  send(data: any): void {
    const message = typeof data === 'string' ? data : JSON.stringify(data)

    if (this.isConnected && this.socket) {
      this.socket.send({ data: message })
    } else {
      // 未连接时加入队列
      this.messageQueue.push(message)
    }
  }

  /**
   * 关闭连接
   */
  close(): void {
    this.stopHeartbeat()
    this.stopReconnect()

    if (this.socket) {
      this.socket.close({ code: 1000, reason: 'Normal closure' })
      this.socket = null
    }

    this.isConnected = false
  }

  /**
   * 订阅事件
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  /**
   * 取消订阅
   */
  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback)
  }

  /**
   * 触发事件
   */
  private emit(event: string, data?: any): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data)
      } catch (e) {
        console.error('[WS] Event callback error:', e)
      }
    })
  }

  /**
   * 心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'heartbeat' })
    }, this.config.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 重连
   */
  private reconnect(): void {
    this.reconnectAttempts++
    console.log(`[WS] Reconnecting... (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {})
    }, this.config.reconnectInterval)
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempts = 0
  }

  /**
   * 发送队列中的消息
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.socket?.send({ data: message })
    }
  }

  /**
   * 是否已连接
   */
  get connected(): boolean {
    return this.isConnected
  }
}

// ==================== 直播服务 ====================

/**
 * 直播服务类
 */
class LiveService {
  private ws: WebSocketManager | null = null
  private roomId: string = ''
  private userId: string = ''
  private messageHandlers: ((msg: LiveMessage) => void)[] = []
  private roomUpdateHandlers: ((room: Partial<LiveRoom>) => void)[] = []

  /**
   * 加入直播间
   */
  async joinRoom(roomId: string, userId: string): Promise<LiveRoom> {
    this.roomId = roomId
    this.userId = userId

    // 获取直播间信息
    const room = await this.getRoomInfo(roomId)

    // 连接 WebSocket
    this.ws = new WebSocketManager({
      url: `wss://live.example.com/ws?room=${roomId}&user=${userId}`,
    })

    this.ws.on('message', this.handleMessage.bind(this))
    this.ws.on('close', this.handleDisconnect.bind(this))

    await this.ws.connect()

    // 发送加入消息
    this.ws.send({
      type: 'join',
      roomId,
      userId,
    })

    return room
  }

  /**
   * 离开直播间
   */
  leaveRoom(): void {
    if (this.ws) {
      this.ws.send({
        type: 'leave',
        roomId: this.roomId,
        userId: this.userId,
      })
      this.ws.close()
      this.ws = null
    }

    this.roomId = ''
    this.messageHandlers = []
    this.roomUpdateHandlers = []
  }

  /**
   * 发送弹幕
   */
  sendDanmaku(content: string): void {
    if (!this.ws?.connected) return

    this.ws.send({
      type: 'chat',
      roomId: this.roomId,
      userId: this.userId,
      content,
    })
  }

  /**
   * 发送礼物
   */
  sendGift(giftId: string, count: number = 1): void {
    if (!this.ws?.connected) return

    this.ws.send({
      type: 'gift',
      roomId: this.roomId,
      userId: this.userId,
      giftId,
      count,
    })
  }

  /**
   * 点赞
   */
  sendLike(): void {
    if (!this.ws?.connected) return

    this.ws.send({
      type: 'like',
      roomId: this.roomId,
      userId: this.userId,
    })
  }

  /**
   * 订阅消息
   */
  onMessage(handler: (msg: LiveMessage) => void): () => void {
    this.messageHandlers.push(handler)
    return () => {
      const index = this.messageHandlers.indexOf(handler)
      if (index > -1) {
        this.messageHandlers.splice(index, 1)
      }
    }
  }

  /**
   * 订阅房间更新
   */
  onRoomUpdate(handler: (room: Partial<LiveRoom>) => void): () => void {
    this.roomUpdateHandlers.push(handler)
    return () => {
      const index = this.roomUpdateHandlers.indexOf(handler)
      if (index > -1) {
        this.roomUpdateHandlers.splice(index, 1)
      }
    }
  }

  /**
   * 处理消息
   */
  private handleMessage(data: any): void {
    if (data.type === 'message') {
      const msg: LiveMessage = data.data
      this.messageHandlers.forEach((handler) => handler(msg))
    } else if (data.type === 'room_update') {
      this.roomUpdateHandlers.forEach((handler) => handler(data.data))
    }
  }

  /**
   * 处理断开连接
   */
  private handleDisconnect(): void {
    console.log('[Live] Disconnected from room')
  }

  /**
   * 获取直播间信息
   */
  private async getRoomInfo(roomId: string): Promise<LiveRoom> {
    // Mock 数据
    return {
      id: roomId,
      title: '直播测试',
      coverUrl: 'https://placehold.co/720x1280/fe2c55/fff?text=LIVE',
      anchorId: 'anchor_001',
      anchorName: '主播小哥',
      anchorAvatar: 'https://placehold.co/100x100/333/fff?text=A',
      status: 'living',
      viewerCount: Math.floor(1000 + Math.random() * 9000),
      likeCount: Math.floor(10000 + Math.random() * 90000),
      startTime: new Date().toISOString(),
      pullUrl: 'https://example.com/live/stream.m3u8',
    }
  }

  /**
   * 获取礼物列表
   */
  async getGiftList(): Promise<Gift[]> {
    // Mock 礼物数据
    return [
      { id: 'gift_1', name: '小心心', icon: '❤️', price: 1 },
      { id: 'gift_2', name: '棒棒糖', icon: '🍭', price: 5 },
      { id: 'gift_3', name: '玫瑰花', icon: '🌹', price: 10 },
      { id: 'gift_4', name: '火箭', icon: '🚀', price: 100 },
      { id: 'gift_5', name: '皇冠', icon: '👑', price: 500 },
    ]
  }
}

// ==================== 导出 ====================

export const liveService = new LiveService()
export default liveService
