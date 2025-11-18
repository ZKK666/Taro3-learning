/**
 * 评论底部弹窗组件
 * 支持上下滑动关闭
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, Image, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { formatNumber, formatTime } from '@/utils/format'
import type { CommentInfo } from '@/types/comment'
import styles from './index.module.scss'

interface CommentSheetProps {
  visible: boolean
  videoId: string
  onClose: () => void
}

// Mock评论数据
const mockComments: CommentInfo[] = Array.from({ length: 30 }, (_, i) => ({
  id: `comment_${i + 1}`,
  videoId: '',
  userId: `user_${i % 10 + 1}`,
  userAvatar: `https://placehold.co/100x100/333/fff?random=c${i + 1}`,
  userName: ['小明', '小红', '阿华', '晓峰', '美美', '大强', '小丽', '阿杰', '琳琳', '小伟'][i % 10],
  content: [
    '太好看了！',
    '学到了 感谢分享',
    '这也太绝了吧',
    '我也想试试',
    '哈哈哈哈太搞笑了',
    '第一次看到这么棒的内容',
    '博主真厉害',
    '已收藏 下次做',
    '这个角度选得好',
    '羡慕了',
    '坐标哪里呀？',
    '求教程！',
    '音乐是什么',
    '绝了绝了',
    '爱了爱了'
  ][i % 15],
  likeCount: Math.floor(Math.random() * 1000),
  isLiked: Math.random() > 0.8,
  createTime: new Date(Date.now() - i * 3600000).toISOString(),
  replies: i % 5 === 0 ? [
    {
      id: `reply_${i}_1`,
      videoId: '',
      userId: `user_${(i + 5) % 10 + 1}`,
      userAvatar: `https://placehold.co/100x100/333/fff?random=r${i}`,
      userName: '回复用户',
      content: '同意！',
      likeCount: Math.floor(Math.random() * 100),
      isLiked: false,
      createTime: new Date(Date.now() - i * 1800000).toISOString(),
      replies: [],
      replyCount: 0
    }
  ] : [],
  replyCount: i % 5 === 0 ? 1 : 0
}))

export default function CommentSheet({ visible, videoId, onClose }: CommentSheetProps) {
  const [comments, setComments] = useState<CommentInfo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [translateY, setTranslateY] = useState(0)
  const startY = useRef(0)
  const isDragging = useRef(false)

  useEffect(() => {
    if (visible) {
      setComments(mockComments)
      setTranslateY(0)
    }
  }, [visible, videoId])

  // 触摸开始
  const handleTouchStart = (e: any) => {
    startY.current = e.touches[0].clientY
    isDragging.current = true
  }

  // 触摸移动
  const handleTouchMove = (e: any) => {
    if (!isDragging.current) return
    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current
    if (diff > 0) {
      setTranslateY(diff)
    }
  }

  // 触摸结束
  const handleTouchEnd = () => {
    isDragging.current = false
    if (translateY > 150) {
      onClose()
    } else {
      setTranslateY(0)
    }
  }

  // 点赞评论
  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          isLiked: !c.isLiked,
          likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1
        }
      }
      return c
    }))
    Taro.vibrateShort({ type: 'light' })
  }

  // 发送评论
  const handleSend = () => {
    if (!inputValue.trim()) return

    const newComment: CommentInfo = {
      id: `comment_new_${Date.now()}`,
      videoId,
      userId: 'current_user',
      userAvatar: 'https://placehold.co/100x100/333/fff?random=me',
      userName: '我',
      content: inputValue.trim(),
      likeCount: 0,
      isLiked: false,
      createTime: new Date().toISOString(),
      replies: [],
      replyCount: 0
    }

    setComments(prev => [newComment, ...prev])
    setInputValue('')
    Taro.showToast({ title: '评论成功', icon: 'success', duration: 1500 })
  }

  if (!visible) return null

  return (
    <View className={styles.overlay} onClick={onClose}>
      <View
        className={styles.sheet}
        style={{ transform: `translateY(${translateY}px)` }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 拖动指示器 */}
        <View className={styles.dragIndicator}>
          <View className={styles.indicator} />
        </View>

        {/* 标题 */}
        <View className={styles.header}>
          <Text className={styles.title}>{comments.length} 条评论</Text>
          <View className={styles.closeBtn} onClick={onClose}>
            <View className={styles.closeIcon} />
          </View>
        </View>

        {/* 评论列表 */}
        <ScrollView className={styles.commentList} scrollY>
          {comments.map(comment => (
            <View key={comment.id} className={styles.commentItem}>
              <Image
                className={styles.avatar}
                src={comment.userAvatar}
                mode="aspectFill"
                lazyLoad
              />
              <View className={styles.commentContent}>
                <Text className={styles.userName}>{comment.userName}</Text>
                <Text className={styles.content}>{comment.content}</Text>
                <View className={styles.meta}>
                  <Text className={styles.time}>{formatTime(comment.createTime)}</Text>
                  <Text className={styles.reply}>回复</Text>
                </View>

                {/* 回复 */}
                {comment.replies.length > 0 && (
                  <View className={styles.replies}>
                    {comment.replies.map(reply => (
                      <View key={reply.id} className={styles.replyItem}>
                        <Text className={styles.replyUser}>{reply.userName}</Text>
                        <Text className={styles.replyContent}>{reply.content}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              <View
                className={styles.likeBtn}
                onClick={() => handleLikeComment(comment.id)}
              >
                <View className={`${styles.heartIcon} ${comment.isLiked ? styles.liked : ''}`} />
                <Text className={`${styles.likeCount} ${comment.isLiked ? styles.liked : ''}`}>
                  {comment.likeCount > 0 ? formatNumber(comment.likeCount) : ''}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 输入框 */}
        <View className={styles.inputWrapper}>
          <Input
            className={styles.input}
            placeholder="留下你的精彩评论..."
            placeholderClass={styles.placeholder}
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            onConfirm={handleSend}
            confirmType="send"
          />
          <View
            className={`${styles.sendBtn} ${inputValue.trim() ? styles.active : ''}`}
            onClick={handleSend}
          >
            <Text>发送</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
