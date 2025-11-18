/**
 * 朋友页面 - 好友动态瀑布流
 */

import { useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { navigateTo } from '@/utils/navigation'
import { formatNumber } from '@/utils/format'
import styles from './index.module.scss'

// Mock 好友动态数据 - 瀑布流格式
const mockWaterfallItems = Array.from({ length: 40 }, (_, i) => ({
  id: `item_${i + 1}`,
  user: {
    id: `u${i + 1}`,
    nickname: [
      '小红薯创作者', '美食达人', '旅行家', '舞蹈博主', '知识分享',
      '时尚博主', '摄影师', '健身教练', '美妆达人', '生活家'
    ][i % 10],
    avatarUrl: `https://picsum.photos/200/200?random=user${i + 1}`
  },
  imageUrl: `https://picsum.photos/${300 + (i % 3) * 50}/${400 + (i % 4) * 100}?random=item${i + 1}`,
  title: [
    '今天的穿搭分享', '超好吃的早餐', '绝美日落', '新学的舞蹈',
    '分享一个小技巧', '今日妆容', '旅行打卡', '健身第100天',
    '手作过程记录', '周末日常', '探店发现宝藏', '自制甜品',
    '治愈系风景', '挑战新动作', '知识科普', '新入的好物',
    '美好的一天', '记录生活', '灵感分享', '创意手工'
  ][i % 20],
  likeCount: Math.floor(100 + Math.random() * 9900),
  isLiked: Math.random() > 0.7,
  height: 300 + Math.floor(Math.random() * 200)
}))

// Mock 日常故事数据
const mockStories = [
  {
    id: 's1',
    user: { nickname: '我', avatarUrl: 'https://picsum.photos/200/200?random=me' },
    isAllViewed: true,
    isMine: true
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `s${i + 2}`,
    user: {
      nickname: ['旅行家小美', '舞蹈小王子', '知识分享官', '美食猎人', '时尚icon',
        '健身达人', '摄影大师', '手作匠人', '宠物博主', '音乐人'][i],
      avatarUrl: `https://picsum.photos/200/200?random=story${i + 1}`
    },
    isAllViewed: Math.random() > 0.5
  }))
]

export default function Friends() {
  const [stories] = useState(mockStories)
  const [items, setItems] = useState(mockWaterfallItems)

  useDidShow(() => {
    // 刷新数据
  })

  // 跳转私信
  const handleChat = () => {
    navigateTo('/packageChat/pages/list/index')
  }

  // 点赞
  const handleLike = (itemId: string) => {
    setItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, isLiked: !item.isLiked, likeCount: item.isLiked ? item.likeCount - 1 : item.likeCount + 1 }
        : item
    ))
  }

  // 将items分成左右两列
  const leftColumn: typeof items = []
  const rightColumn: typeof items = []
  let leftHeight = 0
  let rightHeight = 0

  items.forEach(item => {
    if (leftHeight <= rightHeight) {
      leftColumn.push(item)
      leftHeight += item.height
    } else {
      rightColumn.push(item)
      rightHeight += item.height
    }
  })

  return (
    <View className={styles.container}>
      {/* 顶部标题栏 */}
      <View className={styles.header}>
        <Text className={styles.title}>朋友</Text>
        <View className={styles.headerActions}>
          <View className={styles.chatIcon} onClick={handleChat} />
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        {/* 日常故事 */}
        <ScrollView scrollX className={styles.storiesSection} enhanced showScrollbar={false}>
          {stories.map(story => (
            <View key={story.id} className={styles.storyItem}>
              <View className={`${styles.avatarWrapper} ${!story.isAllViewed ? styles.hasNew : ''}`}>
                <Image
                  className={styles.storyAvatar}
                  src={story.user.avatarUrl}
                  mode="aspectFill"
                  lazyLoad
                />
                {story.isMine && (
                  <View className={styles.addBtn}>
                    <View className={styles.plusIcon} />
                  </View>
                )}
              </View>
              <Text className={styles.storyName}>{story.user.nickname}</Text>
            </View>
          ))}
        </ScrollView>

        {/* 瀑布流内容 */}
        <View className={styles.waterfall}>
          {/* 左列 */}
          <View className={styles.column}>
            {leftColumn.map(item => (
              <View key={item.id} className={styles.waterfallItem}>
                <Image
                  className={styles.itemImage}
                  src={item.imageUrl}
                  mode="widthFix"
                  lazyLoad
                />
                <View className={styles.itemInfo}>
                  <Text className={styles.itemTitle}>{item.title}</Text>
                  <View className={styles.itemFooter}>
                    <View className={styles.userInfo}>
                      <Image
                        className={styles.userAvatar}
                        src={item.user.avatarUrl}
                        mode="aspectFill"
                        lazyLoad
                      />
                      <Text className={styles.userName}>{item.user.nickname}</Text>
                    </View>
                    <View
                      className={styles.likeBtn}
                      onClick={() => handleLike(item.id)}
                    >
                      <View className={`${styles.heartIcon} ${item.isLiked ? styles.liked : ''}`} />
                      <Text className={`${styles.likeCount} ${item.isLiked ? styles.liked : ''}`}>
                        {formatNumber(item.likeCount)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* 右列 */}
          <View className={styles.column}>
            {rightColumn.map(item => (
              <View key={item.id} className={styles.waterfallItem}>
                <Image
                  className={styles.itemImage}
                  src={item.imageUrl}
                  mode="widthFix"
                  lazyLoad
                />
                <View className={styles.itemInfo}>
                  <Text className={styles.itemTitle}>{item.title}</Text>
                  <View className={styles.itemFooter}>
                    <View className={styles.userInfo}>
                      <Image
                        className={styles.userAvatar}
                        src={item.user.avatarUrl}
                        mode="aspectFill"
                        lazyLoad
                      />
                      <Text className={styles.userName}>{item.user.nickname}</Text>
                    </View>
                    <View
                      className={styles.likeBtn}
                      onClick={() => handleLike(item.id)}
                    >
                      <View className={`${styles.heartIcon} ${item.isLiked ? styles.liked : ''}`} />
                      <Text className={`${styles.likeCount} ${item.isLiked ? styles.liked : ''}`}>
                        {formatNumber(item.likeCount)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
