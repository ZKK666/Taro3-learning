/**
 * 朋友页面 - 好友动态
 */

import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { navigateTo } from '@/utils/navigation'
import styles from './index.module.scss'

// Mock 好友动态数据
const mockMoments = [
  {
    id: '1',
    user: {
      id: 'u1',
      nickname: '小红薯创作者',
      avatarUrl: 'https://picsum.photos/200/200?random=1'
    },
    type: 'video',
    content: '今天拍了一个超有趣的视频',
    video: {
      coverUrl: 'https://picsum.photos/400/600?random=1',
      title: '跳舞挑战'
    },
    likeCount: 128,
    commentCount: 32,
    isLiked: false,
    createTime: '2小时前'
  },
  {
    id: '2',
    user: {
      id: 'u2',
      nickname: '美食达人阿强',
      avatarUrl: 'https://picsum.photos/200/200?random=2'
    },
    type: 'daily',
    content: '周末的美好时光',
    images: [
      'https://picsum.photos/400/400?random=2',
      'https://picsum.photos/400/400?random=3',
      'https://picsum.photos/400/400?random=4'
    ],
    likeCount: 89,
    commentCount: 15,
    isLiked: true,
    createTime: '5小时前'
  }
]

// Mock 日常故事数据
const mockStories = [
  {
    id: 's1',
    user: {
      nickname: '我',
      avatarUrl: 'https://picsum.photos/200/200?random=me'
    },
    isAllViewed: true,
    isMine: true
  },
  {
    id: 's2',
    user: {
      nickname: '旅行家小美',
      avatarUrl: 'https://picsum.photos/200/200?random=s1'
    },
    isAllViewed: false
  },
  {
    id: 's3',
    user: {
      nickname: '舞蹈小王子',
      avatarUrl: 'https://picsum.photos/200/200?random=s2'
    },
    isAllViewed: false
  },
  {
    id: 's4',
    user: {
      nickname: '知识分享官',
      avatarUrl: 'https://picsum.photos/200/200?random=s3'
    },
    isAllViewed: true
  }
]

export default function Friends() {
  const [stories, setStories] = useState(mockStories)
  const [moments, setMoments] = useState(mockMoments)

  useDidShow(() => {
    // 刷新数据
  })

  // 跳转私信
  const handleChat = () => {
    navigateTo('/packageChat/pages/list/index')
  }

  // 点赞动态
  const handleLike = (momentId: string) => {
    setMoments(prev => prev.map(m =>
      m.id === momentId
        ? { ...m, isLiked: !m.isLiked, likeCount: m.isLiked ? m.likeCount - 1 : m.likeCount + 1 }
        : m
    ))
  }

  return (
    <View className={styles.container}>
      {/* 顶部标题栏 */}
      <View className={styles.header}>
        <Text className={styles.title}>朋友</Text>
        <View className={styles.headerActions}>
          <Text className={styles.actionIcon} onClick={handleChat}>💬</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        {/* 日常故事 */}
        <ScrollView scrollX className={styles.storiesSection}>
          {stories.map(story => (
            <View key={story.id} className={styles.storyItem}>
              <View className={`${styles.avatarWrapper} ${!story.isAllViewed ? styles.hasNew : ''}`}>
                <Image
                  className={styles.storyAvatar}
                  src={story.user.avatarUrl}
                  mode="aspectFill"
                />
                {story.isMine && (
                  <View className={styles.addBtn}>
                    <Text>+</Text>
                  </View>
                )}
              </View>
              <Text className={styles.storyName}>{story.user.nickname}</Text>
            </View>
          ))}
        </ScrollView>

        {/* 动态列表 */}
        <View className={styles.momentsSection}>
          {moments.map(moment => (
            <View key={moment.id} className={styles.momentItem}>
              {/* 用户信息 */}
              <View className={styles.momentHeader}>
                <Image
                  className={styles.momentAvatar}
                  src={moment.user.avatarUrl}
                  mode="aspectFill"
                />
                <View className={styles.momentUserInfo}>
                  <Text className={styles.momentNickname}>{moment.user.nickname}</Text>
                  <Text className={styles.momentTime}>{moment.createTime}</Text>
                </View>
              </View>

              {/* 内容 */}
              <Text className={styles.momentContent}>{moment.content}</Text>

              {/* 媒体内容 */}
              {moment.type === 'video' && moment.video && (
                <View className={styles.videoCover}>
                  <Image
                    className={styles.coverImage}
                    src={moment.video.coverUrl}
                    mode="aspectFill"
                  />
                  <View className={styles.playIcon}>
                    <Text>▶</Text>
                  </View>
                </View>
              )}

              {moment.type === 'daily' && moment.images && (
                <View className={styles.imageGrid}>
                  {moment.images.map((img, idx) => (
                    <Image
                      key={idx}
                      className={styles.gridImage}
                      src={img}
                      mode="aspectFill"
                    />
                  ))}
                </View>
              )}

              {/* 互动栏 */}
              <View className={styles.momentActions}>
                <View
                  className={styles.actionBtn}
                  onClick={() => handleLike(moment.id)}
                >
                  <Text className={moment.isLiked ? styles.liked : ''}>
                    {moment.isLiked ? '❤️' : '🤍'} {moment.likeCount}
                  </Text>
                </View>
                <View className={styles.actionBtn}>
                  <Text>💬 {moment.commentCount}</Text>
                </View>
                <View className={styles.actionBtn}>
                  <Text>↗️</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
