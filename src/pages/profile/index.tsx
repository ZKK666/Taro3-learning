/**
 * 个人中心页面
 */

import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useUserStore } from '@/stores'
import { formatNumber } from '@/utils/format'
import { navigateTo, Routes } from '@/utils/navigation'
import styles from './index.module.scss'

export default function Profile() {
  const { userInfo, isLogin, fetchUserInfo } = useUserStore()
  const [activeTab, setActiveTab] = useState<'works' | 'likes'>('works')

  useEffect(() => {
    if (!userInfo) {
      fetchUserInfo()
    }
  }, [])

  // 跳转到消息中心
  const handleMessage = () => {
    navigateTo(Routes.MESSAGE_CENTER)
  }

  // 跳转到设置
  const handleSettings = () => {
    // TODO: 设置页面
  }

  // 跳转到登录
  const handleLogin = () => {
    navigateTo(Routes.LOGIN)
  }

  if (!isLogin || !userInfo) {
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

  return (
    <View className={styles.container}>
      {/* 顶部操作栏 */}
      <View className={styles.header}>
        <View className={styles.headerActions}>
          <Text className={styles.actionIcon} onClick={handleMessage}>🔔</Text>
          <Text className={styles.actionIcon} onClick={handleSettings}>⚙️</Text>
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
              {formatNumber(userInfo.stats.followingCount)}
            </Text>
            <Text className={styles.statLabel}>关注</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {formatNumber(userInfo.stats.followerCount)}
            </Text>
            <Text className={styles.statLabel}>粉丝</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {formatNumber(userInfo.stats.likeCount)}
            </Text>
            <Text className={styles.statLabel}>获赞</Text>
          </View>
        </View>

        {/* 操作按钮 */}
        <View className={styles.actionSection}>
          <View className={styles.editBtn}>
            <Text className={styles.editBtnText}>编辑资料</Text>
          </View>
          <View className={styles.publishBtn} onClick={() => navigateTo(Routes.PUBLISH_CHOOSE)}>
            <Text className={styles.publishBtnText}>发布视频</Text>
          </View>
        </View>

        {/* Tab 切换 */}
        <View className={styles.tabSection}>
          <View
            className={`${styles.tabItem} ${activeTab === 'works' ? styles.active : ''}`}
            onClick={() => setActiveTab('works')}
          >
            <Text className={styles.tabText}>作品 {userInfo.stats.worksCount}</Text>
          </View>
          <View
            className={`${styles.tabItem} ${activeTab === 'likes' ? styles.active : ''}`}
            onClick={() => setActiveTab('likes')}
          >
            <Text className={styles.tabText}>喜欢 {userInfo.stats.likesCount}</Text>
          </View>
        </View>

        {/* 作品列表占位 */}
        <View className={styles.worksSection}>
          <View className={styles.emptyWorks}>
            <Text className={styles.emptyText}>
              {activeTab === 'works' ? '暂无作品' : '暂无喜欢的视频'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
