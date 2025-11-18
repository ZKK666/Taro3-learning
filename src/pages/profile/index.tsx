/**
 * 个人中心页面
 *
 * 展示用户个人信息、作品和喜欢列表
 * 集成登录状态管理，未登录时显示登录引导
 */

import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useUserStore, useAuth } from '@/stores/user'
import { formatNumber } from '@/utils/format'
import { navigateTo, Routes } from '@/utils/navigation'
import styles from './index.module.scss'

// 占位图颜色方案
const workColors = ['1a1a2e', '16213e', '0f3460', '533483', 'e94560', '4a0e4e']
const likeColors = ['2c3e50', '34495e', 'c0392b', '8e44ad', '27ae60', 'f39c12']

// Mock 作品数据
const mockWorks = Array.from({ length: 18 }, (_, i) => ({
  id: `work_${i + 1}`,
  coverUrl: `https://placehold.co/300x400/${workColors[i % 6]}/fff?text=${encodeURIComponent(`作品${i + 1}`)}`,
  playCount: Math.floor(1000 + Math.random() * 99000)
}))

// Mock 喜欢数据
const mockLikes = Array.from({ length: 24 }, (_, i) => ({
  id: `like_${i + 1}`,
  coverUrl: `https://placehold.co/300x400/${likeColors[i % 6]}/fff?text=${encodeURIComponent(`喜欢${i + 1}`)}`,
  playCount: Math.floor(1000 + Math.random() * 99000)
}))

export default function Profile() {
  // 使用新的登录状态管理
  const { isLoggedIn, userInfo, userStats, isInitialized, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'works' | 'likes'>('works')
  const [works] = useState(mockWorks)
  const [likes] = useState(mockLikes)

  // 跳转到消息中心
  const handleMessage = () => {
    navigateTo(Routes.MESSAGE_CENTER)
  }

  // 跳转到设置
  const handleSettings = () => {
    Taro.navigateTo({ url: '/packageSettings/pages/index/index' })
  }

  // 跳转到登录
  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' })
  }

  // 处理登出
  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout()
        }
      }
    })
  }

  // 等待初始化完成
  if (!isInitialized) {
    return (
      <View className={styles.container}>
        <View className={styles.loginTip}>
          <Text className={styles.tipText}>加载中...</Text>
        </View>
      </View>
    )
  }

  // 未登录状态
  if (!isLoggedIn || !userInfo) {
    return (
      <View className={styles.container}>
        <View className={styles.loginTip}>
          <Text className={styles.tipText}>登录后查看个人主页</Text>
          <View className={styles.loginBtn} onClick={handleLogin}>
            <Text className={styles.loginBtnText}>去登录</Text>
          </View>
        </View>
      </View>
    )
  }

  // 获取统计数据，使用userStats或默认值
  const stats = userStats || {
    followingCount: 0,
    followerCount: 0,
    likeCount: 0,
    worksCount: 0,
    likesCount: 0
  }

  return (
    <View className={styles.container}>
      {/* 顶部操作栏 */}
      <View className={styles.header}>
        <View className={styles.headerActions}>
          <View className={styles.bellIcon} onClick={handleMessage} />
          <View className={styles.gearIcon} onClick={handleSettings} />
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        {/* 用户信息 */}
        <View className={styles.userSection}>
          <Image
            className={styles.avatar}
            src={userInfo.avatarUrl}
            mode="aspectFill"
          />
          <Text className={styles.nickname}>{userInfo.nickname}</Text>
          <Text className={styles.uniqueId}>抖音号：{userInfo.uniqueId}</Text>

          {userInfo.bio && (
            <Text className={styles.bio}>{userInfo.bio}</Text>
          )}
        </View>

        {/* 数据统计 */}
        <View className={styles.statsSection}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {formatNumber(stats.followingCount)}
            </Text>
            <Text className={styles.statLabel}>关注</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {formatNumber(stats.followerCount)}
            </Text>
            <Text className={styles.statLabel}>粉丝</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {formatNumber(stats.likeCount)}
            </Text>
            <Text className={styles.statLabel}>获赞</Text>
          </View>
        </View>

        {/* 操作按钮 */}
        <View className={styles.actionSection}>
          <View className={styles.editBtn}>
            <Text className={styles.editBtnText}>编辑资料</Text>
          </View>
          <View className={styles.publishBtn} onClick={handleLogout}>
            <Text className={styles.publishBtnText}>退出登录</Text>
          </View>
        </View>

        {/* Tab 切换 */}
        <View className={styles.tabSection}>
          <View
            className={`${styles.tabItem} ${activeTab === 'works' ? styles.active : ''}`}
            onClick={() => setActiveTab('works')}
          >
            <Text className={styles.tabText}>作品 {stats.worksCount}</Text>
          </View>
          <View
            className={`${styles.tabItem} ${activeTab === 'likes' ? styles.active : ''}`}
            onClick={() => setActiveTab('likes')}
          >
            <Text className={styles.tabText}>喜欢 {stats.likesCount}</Text>
          </View>
        </View>

        {/* 作品/喜欢列表 */}
        <View className={styles.worksSection}>
          {activeTab === 'works' ? (
            works.length > 0 ? (
              <View className={styles.videoGrid}>
                {works.map(work => (
                  <View key={work.id} className={styles.videoItem}>
                    <Image
                      className={styles.videoCover}
                      src={work.coverUrl}
                      mode="aspectFill"
                      lazyLoad
                    />
                    <View className={styles.playInfo}>
                      <View className={styles.playIcon} />
                      <Text className={styles.playCount}>{formatNumber(work.playCount)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyWorks}>
                <Text className={styles.emptyText}>暂无作品</Text>
              </View>
            )
          ) : (
            likes.length > 0 ? (
              <View className={styles.videoGrid}>
                {likes.map(like => (
                  <View key={like.id} className={styles.videoItem}>
                    <Image
                      className={styles.videoCover}
                      src={like.coverUrl}
                      mode="aspectFill"
                      lazyLoad
                    />
                    <View className={styles.playInfo}>
                      <View className={styles.playIcon} />
                      <Text className={styles.playCount}>{formatNumber(like.playCount)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyWorks}>
                <Text className={styles.emptyText}>暂无喜欢的视频</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </View>
  )
}
