/**
 * 直播列表页面
 *
 * 展示正在直播的房间列表：
 * 1. 瀑布流布局展示直播间
 * 2. 显示主播信息、观看人数
 * 3. 支持下拉刷新和加载更多
 * 4. 点击进入直播间
 */

import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro'
import { navigateTo, Routes } from '@/utils/navigation'
import { formatNumber } from '@/utils/format'
import styles from './index.module.scss'

// ==================== 类型定义 ====================

interface LiveRoomItem {
  id: string
  title: string
  coverUrl: string
  anchorId: string
  anchorName: string
  anchorAvatar: string
  viewerCount: number
  category: string
  isLive: boolean
}

// ==================== Mock数据 ====================

const generateMockLiveRooms = (): LiveRoomItem[] => {
  const categories = ['游戏', '音乐', '户外', '美食', '舞蹈', '聊天', '知识', '颜值']
  const titles = [
    '今晚连麦PK',
    '深夜陪聊',
    '户外探险中',
    '美食制作ing',
    '学习直播',
    '游戏开黑',
    '唱歌点歌',
    '日常分享',
  ]
  const colors = ['fe2c55', '25f4ee', '1a1a2e', '533483', '0f3460', '4a0e4e', 'e94560', '16213e']

  return Array.from({ length: 20 }, (_, i) => ({
    id: `live_${i + 1}`,
    title: titles[i % titles.length],
    coverUrl: `https://placehold.co/400x500/${colors[i % 8]}/fff?text=${encodeURIComponent(categories[i % categories.length])}`,
    anchorId: `anchor_${i + 1}`,
    anchorName: `主播${i + 1}号`,
    anchorAvatar: `https://placehold.co/100x100/${colors[i % 8]}/fff?text=${i + 1}`,
    viewerCount: Math.floor(Math.random() * 50000) + 100,
    category: categories[i % categories.length],
    isLive: true,
  }))
}

// ==================== 组件 ====================

export default function LiveList() {
  const [rooms, setRooms] = useState<LiveRoomItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 加载数据
  const loadRooms = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    // 模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 500))

    const newRooms = generateMockLiveRooms()
    setRooms(isRefresh ? newRooms : [...rooms, ...newRooms])

    setLoading(false)
    setRefreshing(false)

    if (isRefresh) {
      Taro.stopPullDownRefresh()
    }
  }

  // 初始化
  useEffect(() => {
    loadRooms()
  }, [])

  // 下拉刷新
  usePullDownRefresh(() => {
    loadRooms(true)
  })

  // 上拉加载更多
  useReachBottom(() => {
    if (!loading) {
      loadRooms()
    }
  })

  // 进入直播间
  const handleEnterRoom = (room: LiveRoomItem) => {
    navigateTo(Routes.LIVE_ROOM, { id: room.id })
  }

  return (
    <View className={styles.container}>
      {/* 顶部分类 */}
      <View className={styles.categories}>
        <View className={`${styles.categoryItem} ${styles.active}`}>
          <Text>推荐</Text>
        </View>
        <View className={styles.categoryItem}>
          <Text>关注</Text>
        </View>
        <View className={styles.categoryItem}>
          <Text>游戏</Text>
        </View>
        <View className={styles.categoryItem}>
          <Text>音乐</Text>
        </View>
        <View className={styles.categoryItem}>
          <Text>户外</Text>
        </View>
      </View>

      {/* 直播列表 */}
      <ScrollView
        className={styles.roomList}
        scrollY
        enableFlex
      >
        <View className={styles.roomGrid}>
          {rooms.map((room, index) => (
            <View
              key={`${room.id}_${index}`}
              className={styles.roomCard}
              onClick={() => handleEnterRoom(room)}
            >
              {/* 封面 */}
              <View className={styles.coverWrapper}>
                <Image
                  className={styles.cover}
                  src={room.coverUrl}
                  mode="aspectFill"
                  lazyLoad
                />

                {/* 直播标识 */}
                <View className={styles.liveBadge}>
                  <View className={styles.liveIcon} />
                  <Text>直播中</Text>
                </View>

                {/* 观看人数 */}
                <View className={styles.viewerCount}>
                  <View className={styles.viewerIcon} />
                  <Text>{formatNumber(room.viewerCount)}</Text>
                </View>

                {/* 分类标签 */}
                <View className={styles.categoryTag}>
                  <Text>{room.category}</Text>
                </View>
              </View>

              {/* 信息 */}
              <View className={styles.roomInfo}>
                <Text className={styles.roomTitle} numberOfLines={1}>
                  {room.title}
                </Text>
                <View className={styles.anchorInfo}>
                  <Image
                    className={styles.anchorAvatar}
                    src={room.anchorAvatar}
                    mode="aspectFill"
                  />
                  <Text className={styles.anchorName}>{room.anchorName}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 加载状态 */}
        {loading && (
          <View className={styles.loading}>
            <Text>加载中...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
