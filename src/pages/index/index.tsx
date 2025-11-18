/**
 * 首页 - 承载推荐/关注 Tab 的壳页面
 */

import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useVideoStore, useAppStore, useUserStore } from '@/stores'
import { navigateTo, Routes } from '@/utils/navigation'
import VideoFeed from './components/VideoFeed'
import styles from './index.module.scss'

export default function Index() {
  const { currentTab, setCurrentTab, fetchRecommendVideos, fetchFollowingVideos } = useVideoStore()
  const { initApp, initialized } = useAppStore()
  const { fetchUserInfo } = useUserStore()
  const [loading, setLoading] = useState(true)

  // 初始化应用
  useEffect(() => {
    const init = async () => {
      try {
        await initApp()
        await fetchUserInfo()
        await fetchRecommendVideos(true)
        setLoading(false)
      } catch (error) {
        console.error('Init error:', error)
        setLoading(false)
      }
    }
    init()
  }, [])

  // 页面显示时刷新数据
  useDidShow(() => {
    if (initialized) {
      // 可以在这里添加刷新逻辑
    }
  })

  // Tab 切换处理
  const handleTabChange = async (tab: 'recommend' | 'following') => {
    if (tab === currentTab) return

    setCurrentTab(tab)

    if (tab === 'recommend') {
      await fetchRecommendVideos(true)
    } else {
      await fetchFollowingVideos(true)
    }
  }

  // 跳转搜索
  const handleSearch = () => {
    navigateTo(Routes.SEARCH)
  }

  // 跳转直播
  const handleLive = () => {
    navigateTo(Routes.LIVE_LIST)
  }

  if (loading) {
    return (
      <View className={styles.loading}>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className={styles.container}>
      {/* 顶部导航 */}
      <View className={styles.header}>
        {/* 直播入口 */}
        <View className={styles.liveBtn} onClick={handleLive}>
          <View className={styles.liveIcon} />
          <Text className={styles.liveBtnText}>直播</Text>
        </View>

        <View className={styles.tabs}>
          <Text
            className={`${styles.tab} ${currentTab === 'recommend' ? styles.active : ''}`}
            onClick={() => handleTabChange('recommend')}
          >
            推荐
          </Text>
          <Text
            className={`${styles.tab} ${currentTab === 'following' ? styles.active : ''}`}
            onClick={() => handleTabChange('following')}
          >
            关注
          </Text>
        </View>
        <View className={styles.search} onClick={handleSearch}>
          <View className={styles.searchIcon} />
        </View>
      </View>

      {/* 视频流 */}
      <VideoFeed />
    </View>
  )
}
