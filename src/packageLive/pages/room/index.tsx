/**
 * 直播间页面
 *
 * 实现完整的直播间功能：
 * 1. 直播视频流（模拟）
 * 2. 弹幕系统
 * 3. 礼物系统
 * 4. 主播信息
 * 5. 观众互动
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, Image, Input, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useUnload } from '@tarojs/taro'
import { useAppStore } from '@/stores'
import { formatNumber } from '@/utils/format'
import { Danmaku, generateMockDanmaku, DanmakuItem } from '@/components/Danmaku'
import { liveService, LiveMessage } from '@/services/live'
import styles from './index.module.scss'

// ==================== 类型定义 ====================

interface Gift {
  id: string
  name: string
  icon: string
  price: number
}

interface RoomInfo {
  id: string
  title: string
  anchorName: string
  anchorAvatar: string
  viewerCount: number
  likeCount: number
}

// ==================== Mock数据 ====================

const mockGifts: Gift[] = [
  { id: 'gift_1', name: '小心心', icon: '❤️', price: 1 },
  { id: 'gift_2', name: '棒棒糖', icon: '🍭', price: 5 },
  { id: 'gift_3', name: '玫瑰花', icon: '🌹', price: 10 },
  { id: 'gift_4', name: '火箭', icon: '🚀', price: 100 },
  { id: 'gift_5', name: '皇冠', icon: '👑', price: 500 },
]

// ==================== 组件 ====================

export default function LiveRoom() {
  const router = useRouter()
  const { systemInfo } = useAppStore()
  const roomId = router.params.id || 'live_1'

  // 房间信息
  const [roomInfo, setRoomInfo] = useState<RoomInfo>({
    id: roomId,
    title: '直播间',
    anchorName: '主播',
    anchorAvatar: 'https://placehold.co/100x100/fe2c55/fff?text=Live',
    viewerCount: 0,
    likeCount: 0,
  })

  // 消息列表
  const [messages, setMessages] = useState<LiveMessage[]>([])
  // 弹幕数据
  const [danmakuData, setDanmakuData] = useState<DanmakuItem[]>([])
  // 当前时间（用于弹幕同步）
  const [currentTime, setCurrentTime] = useState(0)
  // 弹幕输入
  const [inputText, setInputText] = useState('')
  // 弹幕开关
  const [danmakuVisible, setDanmakuVisible] = useState(true)
  // 礼物面板
  const [giftPanelVisible, setGiftPanelVisible] = useState(false)
  // 点赞动画
  const [likeAnimations, setLikeAnimations] = useState<string[]>([])

  // 消息列表滚动
  const scrollRef = useRef<string>('')

  // 初始化直播间
  useEffect(() => {
    // 加载房间信息
    loadRoomInfo()

    // 生成初始弹幕
    const initialDanmaku = generateMockDanmaku(100, 300)
    setDanmakuData(initialDanmaku)

    // 模拟时间流逝（用于弹幕）
    const timer = setInterval(() => {
      setCurrentTime(prev => (prev + 0.1) % 300)
    }, 100)

    // 模拟消息接收
    const messageTimer = setInterval(() => {
      addMockMessage()
    }, 2000 + Math.random() * 3000)

    // 模拟观众数量变化
    const viewerTimer = setInterval(() => {
      setRoomInfo(prev => ({
        ...prev,
        viewerCount: prev.viewerCount + Math.floor(Math.random() * 10) - 3,
      }))
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(messageTimer)
      clearInterval(viewerTimer)
    }
  }, [roomId])

  // 离开时清理
  useUnload(() => {
    liveService.leaveRoom()
  })

  // 加载房间信息
  const loadRoomInfo = async () => {
    // 模拟加载
    await new Promise(resolve => setTimeout(resolve, 300))

    setRoomInfo({
      id: roomId,
      title: '今晚不下播',
      anchorName: '主播小哥',
      anchorAvatar: `https://placehold.co/100x100/333/fff?random=${roomId}`,
      viewerCount: Math.floor(Math.random() * 10000) + 1000,
      likeCount: Math.floor(Math.random() * 100000) + 10000,
    })
  }

  // 添加模拟消息
  const addMockMessage = () => {
    const mockTexts = [
      '主播好厉害',
      '来了来了',
      '太强了',
      '学到了',
      '666666',
      '哈哈哈哈',
      '感谢主播',
      '继续继续',
    ]

    const newMessage: LiveMessage = {
      id: `msg_${Date.now()}`,
      type: 'chat',
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      userName: `用户${Math.floor(Math.random() * 1000)}`,
      userAvatar: `https://placehold.co/50x50/333/fff?random=${Math.random()}`,
      content: mockTexts[Math.floor(Math.random() * mockTexts.length)],
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev.slice(-50), newMessage])
    scrollRef.current = `msg_${newMessage.id}`
  }

  // 发送弹幕
  const handleSendDanmaku = () => {
    if (!inputText.trim()) return

    // 添加到弹幕
    const newDanmaku: DanmakuItem = {
      id: `danmaku_${Date.now()}`,
      text: inputText.trim(),
      type: 'scroll',
      time: currentTime,
      color: '#25f4ee',
    }
    setDanmakuData(prev => [...prev, newDanmaku])

    // 添加到消息列表
    const newMessage: LiveMessage = {
      id: `msg_${Date.now()}`,
      type: 'chat',
      userId: 'self',
      userName: '我',
      userAvatar: 'https://placehold.co/50x50/333/fff?random=self',
      content: inputText.trim(),
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev.slice(-50), newMessage])

    setInputText('')

    // 震动反馈
    Taro.vibrateShort({ type: 'light' })
  }

  // 发送礼物
  const handleSendGift = (gift: Gift) => {
    const newMessage: LiveMessage = {
      id: `msg_${Date.now()}`,
      type: 'gift',
      userId: 'self',
      userName: '我',
      userAvatar: 'https://placehold.co/50x50/333/fff?random=self',
      content: `送出 ${gift.name}`,
      giftId: gift.id,
      giftCount: 1,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev.slice(-50), newMessage])

    setGiftPanelVisible(false)
    Taro.vibrateShort({ type: 'medium' })

    // 显示礼物效果提示
    Taro.showToast({
      title: `送出 ${gift.icon} ${gift.name}`,
      icon: 'none',
    })
  }

  // 点赞
  const handleLike = () => {
    setRoomInfo(prev => ({
      ...prev,
      likeCount: prev.likeCount + 1,
    }))

    // 添加点赞动画
    const animationId = `like_${Date.now()}`
    setLikeAnimations(prev => [...prev, animationId])

    // 移除动画
    setTimeout(() => {
      setLikeAnimations(prev => prev.filter(id => id !== animationId))
    }, 1000)

    Taro.vibrateShort({ type: 'light' })
  }

  // 关闭直播间
  const handleClose = () => {
    Taro.navigateBack()
  }

  return (
    <View className={styles.container}>
      {/* 直播画面（模拟） */}
      <View className={styles.videoArea}>
        <Image
          className={styles.videoBg}
          src={`https://placehold.co/720x1280/1a1a2e/fff?random=${roomId}`}
          mode="aspectFill"
        />

        {/* 弹幕层 */}
        <Danmaku
          data={danmakuData}
          currentTime={currentTime}
          playing={true}
          visible={danmakuVisible}
          width={systemInfo.windowWidth}
          height={systemInfo.windowHeight * 0.6}
          opacity={0.9}
          speed={1}
          density={0.8}
          fontSize={24}
        />
      </View>

      {/* 顶部信息栏 */}
      <View className={styles.topBar}>
        {/* 主播信息 */}
        <View className={styles.anchorInfo}>
          <Image
            className={styles.anchorAvatar}
            src={roomInfo.anchorAvatar}
            mode="aspectFill"
          />
          <View className={styles.anchorMeta}>
            <Text className={styles.anchorName}>{roomInfo.anchorName}</Text>
            <Text className={styles.viewerCount}>
              {formatNumber(roomInfo.viewerCount)} 观看
            </Text>
          </View>
          <View className={styles.followBtn}>
            <Text>关注</Text>
          </View>
        </View>

        {/* 关闭按钮 */}
        <View className={styles.closeBtn} onClick={handleClose}>
          <View className={styles.closeIcon} />
        </View>
      </View>

      {/* 消息列表 */}
      <ScrollView
        className={styles.messageList}
        scrollY
        scrollIntoView={scrollRef.current}
        scrollWithAnimation
      >
        {messages.map(msg => (
          <View key={msg.id} id={`msg_${msg.id}`} className={styles.messageItem}>
            {msg.type === 'gift' ? (
              <View className={styles.giftMessage}>
                <Text className={styles.userName}>{msg.userName}</Text>
                <Text className={styles.giftText}>{msg.content}</Text>
              </View>
            ) : (
              <View className={styles.chatMessage}>
                <Text className={styles.userName}>{msg.userName}：</Text>
                <Text className={styles.messageText}>{msg.content}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* 点赞动画 */}
      <View className={styles.likeAnimations}>
        {likeAnimations.map(id => (
          <View key={id} className={styles.likeHeart}>❤️</View>
        ))}
      </View>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        {/* 弹幕输入 */}
        <View className={styles.inputWrapper}>
          <Input
            className={styles.input}
            value={inputText}
            placeholder="说点什么..."
            placeholderStyle="color: rgba(255,255,255,0.5)"
            maxlength={30}
            onInput={(e) => setInputText(e.detail.value)}
            onConfirm={handleSendDanmaku}
          />
        </View>

        {/* 弹幕开关 */}
        <View
          className={`${styles.iconBtn} ${danmakuVisible ? styles.active : ''}`}
          onClick={() => setDanmakuVisible(!danmakuVisible)}
        >
          <View className={styles.danmakuIcon} />
        </View>

        {/* 礼物按钮 */}
        <View
          className={styles.iconBtn}
          onClick={() => setGiftPanelVisible(true)}
        >
          <View className={styles.giftIcon} />
        </View>

        {/* 点赞按钮 */}
        <View className={styles.likeBtn} onClick={handleLike}>
          <View className={styles.heartIcon} />
        </View>
      </View>

      {/* 礼物面板 */}
      {giftPanelVisible && (
        <View className={styles.giftPanel}>
          <View className={styles.giftPanelMask} onClick={() => setGiftPanelVisible(false)} />
          <View className={styles.giftPanelContent}>
            <View className={styles.giftPanelHeader}>
              <Text>礼物</Text>
            </View>
            <View className={styles.giftList}>
              {mockGifts.map(gift => (
                <View
                  key={gift.id}
                  className={styles.giftItem}
                  onClick={() => handleSendGift(gift)}
                >
                  <Text className={styles.giftEmoji}>{gift.icon}</Text>
                  <Text className={styles.giftName}>{gift.name}</Text>
                  <Text className={styles.giftPrice}>{gift.price}币</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
