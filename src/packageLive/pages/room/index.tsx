/**
 * 直播间页面 - 升级版
 *
 * 完整的直播间功能实现：
 * 1. 安全区域适配（刘海屏、底部安全区）
 * 2. 视频流模拟
 * 3. 实时弹幕系统
 * 4. 丰富的礼物系统 + 炫酷动效
 * 5. 主播信息与互动
 * 6. 用户评论消息
 *
 * 【动效学习要点】
 * - CSS Keyframes 动画
 * - Transform 变换组合
 * - 贝塞尔曲线缓动
 * - 粒子效果模拟
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { View, Text, Image, Input, ScrollView, Video, Canvas } from '@tarojs/components'
import Taro, { useRouter, useUnload } from '@tarojs/taro'
import { useSafeArea, getDanmakuArea, getLiveMessageArea } from '@/utils/safeArea'
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
  animation: 'float' | 'explode' | 'rocket' | 'rain' | 'heart' | 'crown' | 'firework'
  color: string
}

interface GiftAnimation {
  id: string
  gift: Gift
  count: number
  timestamp: number
  userName?: string
  userAvatar?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface LuxuryEffect {
  id: string
  gift: Gift
  count: number
  userName: string
  userAvatar: string
}

interface RoomInfo {
  id: string
  title: string
  anchorName: string
  anchorAvatar: string
  anchorLevel: number
  viewerCount: number
  likeCount: number
  category: string
  tags: string[]
}

// ==================== 礼物数据 ====================

const mockGifts: Gift[] = [
  { id: 'gift_1', name: '小心心', icon: '❤️', price: 1, animation: 'heart', color: '#fe2c55' },
  { id: 'gift_2', name: '棒棒糖', icon: '🍭', price: 5, animation: 'float', color: '#ff69b4' },
  { id: 'gift_3', name: '玫瑰花', icon: '🌹', price: 10, animation: 'rain', color: '#ff4757' },
  { id: 'gift_4', name: '啤酒', icon: '🍺', price: 20, animation: 'float', color: '#ffa502' },
  { id: 'gift_5', name: '蛋糕', icon: '🎂', price: 52, animation: 'explode', color: '#ff6b81' },
  { id: 'gift_6', name: '钻石', icon: '💎', price: 100, animation: 'explode', color: '#70a1ff' },
  { id: 'gift_7', name: '火箭', icon: '🚀', price: 500, animation: 'rocket', color: '#ff6348' },
  { id: 'gift_8', name: '皇冠', icon: '👑', price: 1000, animation: 'crown', color: '#ffd700' },
  { id: 'gift_9', name: '跑车', icon: '🏎️', price: 2000, animation: 'rocket', color: '#c0392b' },
  { id: 'gift_10', name: '烟花', icon: '🎆', price: 5000, animation: 'firework', color: '#9b59b6' },
  { id: 'gift_11', name: '城堡', icon: '🏰', price: 10000, animation: 'firework', color: '#3498db' },
  { id: 'gift_12', name: '游艇', icon: '🛥️', price: 52000, animation: 'rocket', color: '#1abc9c' },
]

// ==================== Mock视频流 ====================

const liveVideoUrls = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
]

// ==================== Mock房间数据 ====================

const mockRoomData: Record<string, RoomInfo> = {
  'live_1': {
    id: 'live_1',
    title: '今晚不下播！陪你到天亮',
    anchorName: '主播小哥',
    anchorAvatar: 'https://placehold.co/100x100/fe2c55/fff?text=A',
    anchorLevel: 48,
    viewerCount: 12580,
    likeCount: 856000,
    category: '聊天',
    tags: ['深夜陪伴', '连麦PK'],
  },
  'live_2': {
    id: 'live_2',
    title: '绝地求生 冲击王牌',
    anchorName: '游戏大神',
    anchorAvatar: 'https://placehold.co/100x100/25f4ee/fff?text=G',
    anchorLevel: 65,
    viewerCount: 45200,
    likeCount: 2350000,
    category: '游戏',
    tags: ['吃鸡', '技术流'],
  },
  'live_3': {
    id: 'live_3',
    title: '古风舞蹈教学',
    anchorName: '舞蹈小仙女',
    anchorAvatar: 'https://placehold.co/100x100/ff69b4/fff?text=D',
    anchorLevel: 52,
    viewerCount: 8900,
    likeCount: 520000,
    category: '舞蹈',
    tags: ['古风', '教学'],
  },
}

// ==================== 组件 ====================

export default function LiveRoom() {
  const router = useRouter()
  const safeArea = useSafeArea()
  const roomId = router.params.id || 'live_1'

  // 房间信息
  const [roomInfo, setRoomInfo] = useState<RoomInfo>({
    id: roomId,
    title: '直播间',
    anchorName: '主播',
    anchorAvatar: 'https://placehold.co/100x100/fe2c55/fff?text=Live',
    anchorLevel: 1,
    viewerCount: 0,
    likeCount: 0,
    category: '聊天',
    tags: [],
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
  // 礼物动画队列
  const [giftAnimations, setGiftAnimations] = useState<GiftAnimation[]>([])
  // 选中的礼物
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  // 礼物数量
  const [giftCount, setGiftCount] = useState(1)
  // 是否关注
  const [isFollowed, setIsFollowed] = useState(false)
  // 豪华礼物特效
  const [luxuryEffects, setLuxuryEffects] = useState<LuxuryEffect[]>([])
  // 全屏闪光
  const [screenFlash, setScreenFlash] = useState<string | null>(null)
  // 粒子系统
  const [particles, setParticles] = useState<Particle[]>([])

  // 消息列表滚动
  const scrollRef = useRef<string>('')
  // Canvas context
  const canvasRef = useRef<any>(null)
  // 粒子动画帧
  const particleFrameRef = useRef<number>(0)

  // 计算弹幕区域
  const danmakuArea = useMemo(() => getDanmakuArea(), [])
  const messageArea = useMemo(() => getLiveMessageArea(), [])

  // 视频URL
  const videoUrl = useMemo(() => {
    const index = parseInt(roomId.replace('live_', '')) % liveVideoUrls.length
    return liveVideoUrls[index]
  }, [roomId])

  // 初始化直播间
  useEffect(() => {
    loadRoomInfo()

    // 生成初始弹幕
    const initialDanmaku = generateMockDanmaku(150, 600)
    setDanmakuData(initialDanmaku)

    // 模拟时间流逝
    const timer = setInterval(() => {
      setCurrentTime(prev => (prev + 0.1) % 600)
    }, 100)

    // 模拟消息接收
    const messageTimer = setInterval(() => {
      addMockMessage()
    }, 1500 + Math.random() * 2000)

    // 模拟观众数量变化
    const viewerTimer = setInterval(() => {
      setRoomInfo(prev => ({
        ...prev,
        viewerCount: Math.max(100, prev.viewerCount + Math.floor(Math.random() * 20) - 8),
      }))
    }, 3000)

    // 模拟随机礼物
    const giftTimer = setInterval(() => {
      if (Math.random() > 0.7) {
        simulateRandomGift()
      }
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(messageTimer)
      clearInterval(viewerTimer)
      clearInterval(giftTimer)
    }
  }, [roomId])

  // 离开时清理
  useUnload(() => {
    liveService.leaveRoom()
  })

  // 加载房间信息
  const loadRoomInfo = async () => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const mockRoom = mockRoomData[roomId] || {
      id: roomId,
      title: '精彩直播进行中',
      anchorName: `主播${roomId.replace('live_', '')}号`,
      anchorAvatar: `https://placehold.co/100x100/333/fff?text=${roomId.replace('live_', '')}`,
      anchorLevel: Math.floor(Math.random() * 50) + 10,
      viewerCount: Math.floor(Math.random() * 10000) + 500,
      likeCount: Math.floor(Math.random() * 500000) + 10000,
      category: ['游戏', '音乐', '聊天', '舞蹈'][Math.floor(Math.random() * 4)],
      tags: ['精彩', '互动'],
    }

    setRoomInfo(mockRoom)
  }

  // 添加模拟消息
  const addMockMessage = () => {
    const mockTexts = [
      '主播好厉害！', '来了来了', '太强了吧', '学到了', '666666',
      '哈哈哈哈', '感谢主播', '继续继续', '刚来，发生什么了',
      '主播唱首歌呗', '这波操作绝了', '我也想学', '太可爱了',
      '主播加油', '今天状态好好', '什么时候下播', '连麦吗',
      '欢迎新来的朋友', '点点关注不迷路', '感谢礼物',
    ]

    const mockNames = [
      '开心果', '小太阳', '追梦人', '快乐水', '向日葵',
      '小确幸', '暖心人', '星星眼', '甜甜圈', '小幸运',
    ]

    const newMessage: LiveMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      type: 'chat',
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      userName: mockNames[Math.floor(Math.random() * mockNames.length)],
      userAvatar: `https://placehold.co/50x50/${['fe2c55', '25f4ee', 'ff69b4', 'ffa502', '70a1ff'][Math.floor(Math.random() * 5)]}/fff`,
      content: mockTexts[Math.floor(Math.random() * mockTexts.length)],
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev.slice(-100), newMessage])
    scrollRef.current = `msg_${newMessage.id}`
  }

  // 模拟随机礼物
  const simulateRandomGift = () => {
    // 偶尔出现高价礼物增加趣味性
    const isLuxury = Math.random() > 0.9
    const giftIndex = isLuxury
      ? Math.floor(Math.random() * 5) + 7 // 高价礼物 (索引7-11)
      : Math.floor(Math.random() * 7) // 普通礼物 (索引0-6)
    const gift = mockGifts[giftIndex]
    const userName = ['小可爱', '大帅哥', '小姐姐', '路人甲', '土豪哥', '神秘人'][Math.floor(Math.random() * 6)]
    const colors = ['fe2c55', '25f4ee', 'ffd700', 'ff69b4', '70a1ff', '9b59b6']
    const userAvatar = `https://placehold.co/60x60/${colors[Math.floor(Math.random() * colors.length)]}/fff?text=${userName[0]}`
    const count = isLuxury ? [1, 1, 1, 10][Math.floor(Math.random() * 4)] : 1

    // 添加消息
    const newMessage: LiveMessage = {
      id: `msg_${Date.now()}`,
      type: 'gift',
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      userName,
      userAvatar,
      content: `送出 ${gift.name} x${count}`,
      giftId: gift.id,
      giftCount: count,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev.slice(-100), newMessage])

    // 触发动画
    triggerGiftAnimation(gift, count, userName, userAvatar)
  }

  // 发送弹幕
  const handleSendDanmaku = () => {
    if (!inputText.trim()) return

    const newDanmaku: DanmakuItem = {
      id: `danmaku_${Date.now()}`,
      text: inputText.trim(),
      type: 'scroll',
      time: currentTime,
      color: '#25f4ee',
    }
    setDanmakuData(prev => [...prev, newDanmaku])

    const newMessage: LiveMessage = {
      id: `msg_${Date.now()}`,
      type: 'chat',
      userId: 'self',
      userName: '我',
      userAvatar: 'https://placehold.co/50x50/25f4ee/fff?text=Me',
      content: inputText.trim(),
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev.slice(-100), newMessage])

    setInputText('')
    Taro.vibrateShort({ type: 'light' })
  }

  // 创建粒子爆炸效果
  const createParticleExplosion = useCallback((x: number, y: number, color: string, count: number = 30) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 3 + Math.random() * 5
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
        size: 3 + Math.random() * 4,
      })
    }
    setParticles(prev => [...prev, ...newParticles])

    // 清理粒子
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.life > 0))
    }, 2000)
  }, [])

  // 更新粒子位置
  useEffect(() => {
    if (particles.length === 0) return

    const updateParticles = () => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15, // 重力
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0)
      )
      particleFrameRef.current = requestAnimationFrame(updateParticles)
    }

    particleFrameRef.current = requestAnimationFrame(updateParticles)
    return () => cancelAnimationFrame(particleFrameRef.current)
  }, [particles.length > 0])

  // 触发礼物动画
  const triggerGiftAnimation = useCallback((gift: Gift, count: number, userName: string = '用户', userAvatar: string = '') => {
    const animationId = `anim_${Date.now()}_${Math.random()}`
    const newAnimation: GiftAnimation = {
      id: animationId,
      gift,
      count,
      timestamp: Date.now(),
      userName,
      userAvatar,
    }

    setGiftAnimations(prev => [...prev, newAnimation])

    // 高价礼物特殊效果
    if (gift.price >= 1000) {
      // 全屏闪光
      setScreenFlash(gift.color)
      setTimeout(() => setScreenFlash(null), 800)

      // 豪华横幅
      const luxuryId = `luxury_${Date.now()}`
      setLuxuryEffects(prev => [...prev, {
        id: luxuryId,
        gift,
        count,
        userName,
        userAvatar: userAvatar || 'https://placehold.co/60x60/ffd700/fff?text=VIP',
      }])
      setTimeout(() => {
        setLuxuryEffects(prev => prev.filter(e => e.id !== luxuryId))
      }, 3500)

      // 粒子爆炸
      const centerX = safeArea.screenWidth / 2
      const centerY = safeArea.screenHeight / 2
      createParticleExplosion(centerX, centerY, gift.color, gift.price >= 5000 ? 60 : 40)
    } else if (gift.price >= 100) {
      // 中等价位礼物也添加粒子
      const centerX = safeArea.screenWidth / 2
      const centerY = safeArea.screenHeight / 2
      createParticleExplosion(centerX, centerY, gift.color, 20)
    }

    // 动画结束后移除
    const duration = gift.animation === 'firework' ? 4000 :
                     gift.animation === 'rocket' ? 3000 :
                     gift.price >= 1000 ? 3000 : 2500
    setTimeout(() => {
      setGiftAnimations(prev => prev.filter(a => a.id !== animationId))
    }, duration)
  }, [safeArea, createParticleExplosion])

  // 发送礼物
  const handleSendGift = () => {
    if (!selectedGift) return

    const newMessage: LiveMessage = {
      id: `msg_${Date.now()}`,
      type: 'gift',
      userId: 'self',
      userName: '我',
      userAvatar: 'https://placehold.co/50x50/25f4ee/fff?text=Me',
      content: `送出 ${selectedGift.name} x${giftCount}`,
      giftId: selectedGift.id,
      giftCount,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev.slice(-100), newMessage])

    // 触发动画
    triggerGiftAnimation(
      selectedGift,
      giftCount,
      '我',
      'https://placehold.co/60x60/25f4ee/fff?text=Me'
    )

    setGiftPanelVisible(false)
    setSelectedGift(null)
    setGiftCount(1)
    // 高价礼物震动更强
    Taro.vibrateShort({ type: selectedGift.price >= 1000 ? 'heavy' : 'medium' })
  }

  // 点赞
  const handleLike = () => {
    setRoomInfo(prev => ({
      ...prev,
      likeCount: prev.likeCount + 1,
    }))

    const animationId = `like_${Date.now()}_${Math.random()}`
    setLikeAnimations(prev => [...prev.slice(-20), animationId])

    setTimeout(() => {
      setLikeAnimations(prev => prev.filter(id => id !== animationId))
    }, 1500)

    Taro.vibrateShort({ type: 'light' })
  }

  // 关闭直播间
  const handleClose = () => {
    Taro.navigateBack()
  }

  // 关注
  const handleFollow = () => {
    setIsFollowed(!isFollowed)
    Taro.vibrateShort({ type: 'medium' })
  }

  return (
    <View className={styles.container}>
      {/* 直播视频流 */}
      <View className={styles.videoArea}>
        <Video
          id="live-video"
          className={styles.liveVideo}
          src={videoUrl}
          autoplay
          loop
          muted={false}
          showCenterPlayBtn={false}
          showPlayBtn={false}
          showFullscreenBtn={false}
          showProgress={false}
          controls={false}
          objectFit="cover"
          enableProgressGesture={false}
        />

        {/* 弹幕层 */}
        <View
          className={styles.danmakuLayer}
          style={{
            top: `${danmakuArea.top}px`,
            height: `${danmakuArea.height}px`,
          }}
        >
          <Danmaku
            data={danmakuData}
            currentTime={currentTime}
            playing={true}
            visible={danmakuVisible}
            width={safeArea.screenWidth}
            height={danmakuArea.height}
            opacity={0.9}
            speed={1.2}
            density={0.8}
            fontSize={26}
          />
        </View>
      </View>

      {/* 顶部信息栏 */}
      <View
        className={styles.topBar}
        style={{ paddingTop: `${safeArea.top + 10}px` }}
      >
        {/* 主播信息 */}
        <View className={styles.anchorInfo}>
          <View className={styles.anchorAvatarWrapper}>
            <Image
              className={styles.anchorAvatar}
              src={roomInfo.anchorAvatar}
              mode="aspectFill"
            />
            <View className={styles.liveIndicator} />
          </View>
          <View className={styles.anchorMeta}>
            <View className={styles.anchorNameRow}>
              <Text className={styles.anchorName}>{roomInfo.anchorName}</Text>
              <View className={styles.levelBadge}>
                <Text>Lv.{roomInfo.anchorLevel}</Text>
              </View>
            </View>
            <Text className={styles.viewerCount}>
              {formatNumber(roomInfo.viewerCount)} 在线
            </Text>
          </View>
          <View
            className={`${styles.followBtn} ${isFollowed ? styles.followed : ''}`}
            onClick={handleFollow}
          >
            <Text>{isFollowed ? '已关注' : '+ 关注'}</Text>
          </View>
        </View>

        {/* 右侧按钮 */}
        <View className={styles.topActions}>
          {/* 分类标签 */}
          <View className={styles.categoryTag}>
            <Text>{roomInfo.category}</Text>
          </View>
          {/* 关闭按钮 */}
          <View className={styles.closeBtn} onClick={handleClose}>
            <View className={styles.closeIcon} />
          </View>
        </View>
      </View>

      {/* 房间标题 */}
      <View className={styles.roomTitle} style={{ top: `${safeArea.top + 80}px` }}>
        <Text className={styles.titleText} numberOfLines={1}>
          {roomInfo.title}
        </Text>
        {roomInfo.tags.length > 0 && (
          <View className={styles.tagList}>
            {roomInfo.tags.map(tag => (
              <View key={tag} className={styles.tag}>
                <Text>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 消息列表 */}
      <ScrollView
        className={styles.messageList}
        scrollY
        scrollIntoView={scrollRef.current}
        scrollWithAnimation
        style={{
          bottom: `${messageArea.bottom}px`,
          maxHeight: `${messageArea.maxHeight}px`,
        }}
      >
        {messages.map(msg => (
          <View key={msg.id} id={`msg_${msg.id}`} className={styles.messageItem}>
            {msg.type === 'gift' ? (
              <View className={styles.giftMessage}>
                <Text className={styles.userName}>{msg.userName}</Text>
                <Text className={styles.giftText}>{msg.content}</Text>
              </View>
            ) : msg.type === 'enter' ? (
              <View className={styles.enterMessage}>
                <Text>{msg.userName} 进入了直播间</Text>
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

      {/* 全屏闪光效果 */}
      {screenFlash && (
        <View
          className={styles.screenFlash}
          style={{ '--gift-color': screenFlash } as React.CSSProperties}
        />
      )}

      {/* 礼物动画层 */}
      <View className={styles.giftAnimationLayer}>
        {giftAnimations.map(anim => (
          <View
            key={anim.id}
            className={`${styles.giftAnimation} ${styles[`anim_${anim.gift.animation}`]}`}
            style={{ '--gift-color': anim.gift.color } as React.CSSProperties}
          >
            <Text className={styles.giftIcon}>{anim.gift.icon}</Text>
            {anim.count > 1 && (
              <Text className={styles.giftCount}>x{anim.count}</Text>
            )}
          </View>
        ))}

        {/* 粒子效果 */}
        {particles.map((particle, index) => (
          <View
            key={`particle_${index}`}
            style={{
              position: 'absolute',
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              borderRadius: '50%',
              backgroundColor: particle.color,
              opacity: particle.life,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              transform: `scale(${particle.life})`,
            } as React.CSSProperties}
          />
        ))}
      </View>

      {/* 豪华礼物横幅 */}
      {luxuryEffects.map(effect => (
        <View
          key={effect.id}
          className={styles.giftBanner}
          style={{ '--gift-color': effect.gift.color } as React.CSSProperties}
        >
          <Image
            className={styles.bannerAvatar}
            src={effect.userAvatar}
            mode="aspectFill"
          />
          <View className={styles.bannerContent}>
            <Text className={styles.bannerUser}>{effect.userName}</Text>
            <Text className={styles.bannerGift}>
              送出 {effect.gift.name} x{effect.count}
            </Text>
          </View>
          <Text className={styles.bannerIcon}>{effect.gift.icon}</Text>
        </View>
      ))}

      {/* 连击显示 */}
      {giftAnimations.filter(a => a.count >= 10).map(anim => (
        <View
          key={`combo_${anim.id}`}
          className={styles.comboDisplay}
          style={{ '--gift-color': anim.gift.color } as React.CSSProperties}
        >
          <Text className={styles.comboGift}>{anim.gift.icon}</Text>
          <Text className={styles.comboText}>{anim.gift.name}</Text>
          <Text className={styles.comboCount}>x{anim.count}</Text>
        </View>
      ))}

      {/* 点赞动画 */}
      <View className={styles.likeAnimations}>
        {likeAnimations.map(id => (
          <View key={id} className={styles.likeHeart}>
            <Text>❤️</Text>
          </View>
        ))}
      </View>

      {/* 底部操作栏 */}
      <View
        className={styles.bottomBar}
        style={{ paddingBottom: `${safeArea.bottom + 10}px` }}
      >
        {/* 弹幕输入 */}
        <View className={styles.inputWrapper}>
          <Input
            className={styles.input}
            value={inputText}
            placeholder="说点什么..."
            placeholderStyle="color: rgba(255,255,255,0.5)"
            maxlength={50}
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
          className={styles.giftBtn}
          onClick={() => setGiftPanelVisible(true)}
        >
          <Text>🎁</Text>
        </View>

        {/* 点赞按钮 */}
        <View className={styles.likeBtn} onClick={handleLike}>
          <Text>❤️</Text>
          <Text className={styles.likeCount}>{formatNumber(roomInfo.likeCount)}</Text>
        </View>
      </View>

      {/* 礼物面板 */}
      {giftPanelVisible && (
        <View className={styles.giftPanel}>
          <View className={styles.giftPanelMask} onClick={() => setGiftPanelVisible(false)} />
          <View
            className={styles.giftPanelContent}
            style={{ paddingBottom: `${safeArea.bottom + 20}px` }}
          >
            <View className={styles.giftPanelHeader}>
              <Text className={styles.giftPanelTitle}>礼物</Text>
              <Text className={styles.giftBalance}>余额：88888 币</Text>
            </View>

            {/* 礼物列表 */}
            <ScrollView scrollX className={styles.giftList} enhanced showScrollbar={false}>
              {mockGifts.map(gift => (
                <View
                  key={gift.id}
                  className={`${styles.giftItem} ${selectedGift?.id === gift.id ? styles.selected : ''}`}
                  onClick={() => setSelectedGift(gift)}
                >
                  <Text className={styles.giftEmoji}>{gift.icon}</Text>
                  <Text className={styles.giftName}>{gift.name}</Text>
                  <Text className={styles.giftPrice}>{gift.price}币</Text>
                </View>
              ))}
            </ScrollView>

            {/* 数量选择和发送 */}
            <View className={styles.giftActions}>
              <View className={styles.countSelector}>
                {[1, 10, 66, 99, 520, 1314].map(count => (
                  <View
                    key={count}
                    className={`${styles.countItem} ${giftCount === count ? styles.active : ''}`}
                    onClick={() => setGiftCount(count)}
                  >
                    <Text>{count}</Text>
                  </View>
                ))}
              </View>
              <View
                className={`${styles.sendBtn} ${selectedGift ? styles.active : ''}`}
                onClick={handleSendGift}
              >
                <Text>赠送</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
