/**
 * 视频流组件 - 上下滑动切换视频
 */

import { useState, useCallback, useRef } from 'react'
import { View, Swiper, SwiperItem, Video, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useVideoStore, useAppStore } from '@/stores'
import { formatNumber } from '@/utils/format'
import { navigateTo, Routes } from '@/utils/navigation'
import type { VideoInfo } from '@/types/video'
import styles from './index.module.scss'

export default function VideoFeed() {
  const {
    currentTab,
    recommendList,
    followingList,
    currentIndex,
    setCurrentIndex,
    fetchRecommendVideos,
    likeVideo,
    unlikeVideo
  } = useVideoStore()
  const { systemInfo } = useAppStore()

  const [playing, setPlaying] = useState(true)
  const videoRefs = useRef<Record<string, any>>({})

  // 当前视频列表
  const videoList = currentTab === 'recommend' ? recommendList : followingList

  // 滑动切换处理
  const handleSwiperChange = useCallback((e: any) => {
    const newIndex = e.detail.current
    setCurrentIndex(newIndex)

    // 预加载下一页
    if (newIndex >= videoList.length - 3) {
      fetchRecommendVideos()
    }
  }, [videoList.length, setCurrentIndex, fetchRecommendVideos])

  // 点赞处理
  const handleLike = async (video: VideoInfo) => {
    if (video.isLiked) {
      await unlikeVideo(video.id)
    } else {
      await likeVideo(video.id)
      // 点赞动画反馈
      Taro.vibrateShort({ type: 'light' })
    }
  }

  // 评论跳转
  const handleComment = (videoId: string) => {
    navigateTo(Routes.COMMENT, { videoId })
  }

  // 用户主页跳转
  const handleUserProfile = (userId: string) => {
    navigateTo(Routes.USER, { userId })
  }

  // 分享
  const handleShare = (video: VideoInfo) => {
    Taro.showShareMenu({
      withShareTicket: true
    })
  }

  // 视频播放/暂停
  const handleVideoTap = () => {
    setPlaying(!playing)
  }

  if (videoList.length === 0) {
    return (
      <View className={styles.empty}>
        <Text>暂无视频</Text>
      </View>
    )
  }

  return (
    <Swiper
      className={styles.swiper}
      vertical
      current={currentIndex}
      onChange={handleSwiperChange}
      duration={300}
      style={{ height: `${systemInfo.windowHeight}px` }}
    >
      {videoList.map((video, index) => (
        <SwiperItem key={video.id} className={styles.swiperItem}>
          <View className={styles.videoContainer}>
            {/* 视频播放器 */}
            <Video
              id={`video-${video.id}`}
              className={styles.video}
              src={video.videoUrl}
              poster={video.coverUrl}
              loop
              autoplay={index === currentIndex && playing}
              showCenterPlayBtn={false}
              showPlayBtn={false}
              showFullscreenBtn={false}
              showProgress={false}
              controls={false}
              objectFit="cover"
              onClick={handleVideoTap}
            />

            {/* 暂停图标 */}
            {!playing && index === currentIndex && (
              <View className={styles.pauseOverlay}>
                <Text className={styles.pauseIcon}>▶</Text>
              </View>
            )}

            {/* 右侧操作栏 */}
            <View className={styles.actionBar}>
              {/* 头像 */}
              <View
                className={styles.avatarWrapper}
                onClick={() => handleUserProfile(video.author.id)}
              >
                <Image
                  className={styles.avatar}
                  src={video.author.avatarUrl}
                  mode="aspectFill"
                />
                {!video.author.isFollowed && (
                  <View className={styles.followBtn}>
                    <Text className={styles.followIcon}>+</Text>
                  </View>
                )}
              </View>

              {/* 点赞 */}
              <View
                className={styles.actionItem}
                onClick={() => handleLike(video)}
              >
                <Text className={`${styles.actionIcon} ${video.isLiked ? styles.liked : ''}`}>
                  ❤️
                </Text>
                <Text className={styles.actionCount}>
                  {formatNumber(video.likeCount)}
                </Text>
              </View>

              {/* 评论 */}
              <View
                className={styles.actionItem}
                onClick={() => handleComment(video.id)}
              >
                <Text className={styles.actionIcon}>💬</Text>
                <Text className={styles.actionCount}>
                  {formatNumber(video.commentCount)}
                </Text>
              </View>

              {/* 收藏 */}
              <View className={styles.actionItem}>
                <Text className={`${styles.actionIcon} ${video.isCollected ? styles.collected : ''}`}>
                  ⭐
                </Text>
                <Text className={styles.actionCount}>
                  {formatNumber(video.collectCount)}
                </Text>
              </View>

              {/* 分享 */}
              <View
                className={styles.actionItem}
                onClick={() => handleShare(video)}
              >
                <Text className={styles.actionIcon}>↗️</Text>
                <Text className={styles.actionCount}>
                  {formatNumber(video.shareCount)}
                </Text>
              </View>
            </View>

            {/* 底部信息 */}
            <View className={styles.videoInfo}>
              <Text
                className={styles.authorName}
                onClick={() => handleUserProfile(video.author.id)}
              >
                @{video.author.nickname}
              </Text>
              <Text className={styles.description}>{video.description}</Text>

              {/* 话题标签 */}
              {video.topics.length > 0 && (
                <View className={styles.topics}>
                  {video.topics.map(topic => (
                    <Text key={topic.id} className={styles.topic}>
                      #{topic.name}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        </SwiperItem>
      ))}
    </Swiper>
  )
}
