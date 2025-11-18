/**
 * 视频流组件 - 上下滑动切换视频
 * 性能优化版本
 *
 * 【弹幕功能】
 * - 支持开关弹幕显示
 * - 为每个视频生成模拟弹幕
 * - 与视频播放同步
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { View, Swiper, SwiperItem, Video, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useVideoStore, useAppStore } from '@/stores'
import { formatNumber } from '@/utils/format'
import CommentSheet from '@/components/CommentSheet'
import { Danmaku, generateMockDanmaku } from '@/components/Danmaku'
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

  // 当前正在播放的视频ID
  const [playingId, setPlayingId] = useState<string>('')
  // 评论弹窗
  const [commentVisible, setCommentVisible] = useState(false)
  const [commentVideoId, setCommentVideoId] = useState('')
  // 图片轮播当前索引
  const [slideIndexes, setSlideIndexes] = useState<Record<string, number>>({})
  // 双击检测
  const lastTapTime = useRef<number>(0)
  // 视频上下文
  const videoContextRef = useRef<Taro.VideoContext | null>(null)

  // ==================== 弹幕相关状态 ====================
  // 弹幕开关
  const [danmakuVisible, setDanmakuVisible] = useState(true)
  // 当前视频播放时间
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  // 视频时长缓存
  const videoDurationRef = useRef<Record<string, number>>({})

  // 当前视频列表
  const videoList = currentTab === 'recommend' ? recommendList : followingList

  // 为每个视频生成弹幕数据（缓存）
  const danmakuDataMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof generateMockDanmaku>> = {}
    videoList.forEach(video => {
      // 假设视频时长30秒，生成50条弹幕
      map[video.id] = generateMockDanmaku(50, 30)
    })
    return map
  }, [videoList])

  // 当前视频
  const currentVideo = videoList[currentIndex]

  // 初始化播放第一个视频
  useEffect(() => {
    if (videoList.length > 0 && !playingId) {
      setPlayingId(videoList[0].id)
    }
  }, [videoList, playingId])

  // 切换tab时重置
  useEffect(() => {
    if (videoList.length > 0) {
      setPlayingId(videoList[0].id)
    }
  }, [currentTab])

  // 滑动切换处理
  const handleSwiperChange = useCallback((e: any) => {
    const newIndex = e.detail.current
    setCurrentIndex(newIndex)

    // 切换播放视频
    const newVideo = videoList[newIndex]
    if (newVideo) {
      setPlayingId(newVideo.id)
    }

    // 预加载下一页
    if (newIndex >= videoList.length - 3) {
      if (currentTab === 'recommend') {
        fetchRecommendVideos()
      }
    }
  }, [videoList, currentTab, setCurrentIndex, fetchRecommendVideos])

  // 点赞处理
  const handleLike = async (video: VideoInfo) => {
    if (video.isLiked) {
      await unlikeVideo(video.id)
    } else {
      await likeVideo(video.id)
      Taro.vibrateShort({ type: 'light' })
    }
  }

  // 视频点击 - 播放/暂停 + 双击点赞
  const handleVideoTap = (video: VideoInfo) => {
    const now = Date.now()
    const timeDiff = now - lastTapTime.current

    if (timeDiff < 300) {
      // 双击点赞
      if (!video.isLiked) {
        handleLike(video)
      }
      lastTapTime.current = 0
    } else {
      // 单击播放/暂停
      lastTapTime.current = now
      setTimeout(() => {
        if (lastTapTime.current === now) {
          togglePlay(video.id)
        }
      }, 300)
    }
  }

  // 切换播放状态
  const togglePlay = (videoId: string) => {
    if (playingId === videoId) {
      setPlayingId('')
      // 暂停视频
      const ctx = Taro.createVideoContext(`video-${videoId}`)
      ctx?.pause()
    } else {
      setPlayingId(videoId)
      const ctx = Taro.createVideoContext(`video-${videoId}`)
      ctx?.play()
    }
  }

  // 分享
  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true
    })
  }

  // 打开评论
  const handleOpenComment = (videoId: string) => {
    setCommentVideoId(videoId)
    setCommentVisible(true)
    // 暂停视频
    if (playingId) {
      const ctx = Taro.createVideoContext(`video-${playingId}`)
      ctx?.pause()
    }
  }

  // 关闭评论
  const handleCloseComment = () => {
    setCommentVisible(false)
    // 恢复播放
    if (playingId) {
      const ctx = Taro.createVideoContext(`video-${playingId}`)
      ctx?.play()
    }
  }

  // 视频时间更新处理
  const handleTimeUpdate = useCallback((e: any) => {
    setCurrentVideoTime(e.detail.currentTime)
  }, [])

  // 切换弹幕显示
  const toggleDanmaku = useCallback(() => {
    setDanmakuVisible(prev => !prev)
  }, [])

  if (videoList.length === 0) {
    return (
      <View className={styles.empty}>
        <Text>暂无视频</Text>
      </View>
    )
  }

  // 只渲染当前视频前后各1个，优化性能
  const renderIndexes = new Set([
    Math.max(0, currentIndex - 1),
    currentIndex,
    Math.min(videoList.length - 1, currentIndex + 1)
  ])

  return (
    <>
      <Swiper
        className={styles.swiper}
        vertical
        current={currentIndex}
        onChange={handleSwiperChange}
        duration={300}
        circular={false}
        easingFunction="easeOutCubic"
        style={{ height: `${systemInfo.windowHeight}px` }}
      >
      {videoList.map((video, index) => (
        <SwiperItem key={video.id} className={styles.swiperItem}>
          {renderIndexes.has(index) ? (
            <View className={styles.videoContainer}>
              {/* 根据类型渲染视频或图片轮播 */}
              {video.type === 'slideshow' && video.images ? (
                <>
                  {/* 图片轮播 */}
                  <Swiper
                    className={styles.slideSwiper}
                    autoplay={index === currentIndex}
                    interval={3000}
                    circular
                    duration={500}
                    onChange={(e) => {
                      setSlideIndexes(prev => ({
                        ...prev,
                        [video.id]: e.detail.current
                      }))
                    }}
                  >
                    {video.images.map((img, imgIndex) => (
                      <SwiperItem key={imgIndex} className={styles.slideItem}>
                        <Image
                          className={styles.slideImage}
                          src={img}
                          mode="aspectFill"
                          lazyLoad
                        />
                      </SwiperItem>
                    ))}
                  </Swiper>

                  {/* 图片索引指示器 */}
                  <View className={styles.slideIndicator}>
                    <Text className={styles.indicatorText}>
                      {(slideIndexes[video.id] || 0) + 1}/{video.images.length}
                    </Text>
                  </View>

                  {/* 底部进度指示器 */}
                  <View className={styles.slideProgress}>
                    {/* 进度点指示器 */}
                    <View className={styles.progressDots}>
                      {video.images.map((_, dotIndex) => (
                        <View
                          key={dotIndex}
                          className={`${styles.progressDot} ${
                            dotIndex === (slideIndexes[video.id] || 0) ? styles.activeDot : ''
                          }`}
                        >
                          {/* 当前激活的点显示进度条动画 */}
                          {dotIndex === (slideIndexes[video.id] || 0) && index === currentIndex && (
                            <View
                              className={styles.progressFill}
                              key={`progress-${video.id}-${dotIndex}-${slideIndexes[video.id] || 0}`}
                            />
                          )}
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 图片类型标识 */}
                  <View className={styles.slideshowBadge}>
                    <View className={styles.imageIcon} />
                  </View>
                </>
              ) : (
                <>
                  {/* 视频播放器 */}
                  <Video
                    id={`video-${video.id}`}
                    className={styles.video}
                    src={video.videoUrl}
                    poster={video.coverUrl}
                    loop
                    autoplay={video.id === playingId}
                    muted={false}
                    showCenterPlayBtn={false}
                    showPlayBtn={false}
                    showFullscreenBtn={false}
                    showProgress={false}
                    controls={false}
                    objectFit="cover"
                    onClick={() => handleVideoTap(video)}
                    onTimeUpdate={video.id === playingId ? handleTimeUpdate : undefined}
                    onEnded={() => {
                      const ctx = Taro.createVideoContext(`video-${video.id}`)
                      ctx?.seek(0)
                      ctx?.play()
                    }}
                  />

                  {/* 弹幕层 */}
                  {video.type !== 'slideshow' && index === currentIndex && (
                    <Danmaku
                      data={danmakuDataMap[video.id] || []}
                      currentTime={currentVideoTime}
                      playing={playingId === video.id}
                      visible={danmakuVisible}
                      width={systemInfo.windowWidth}
                      height={systemInfo.windowHeight - 200}
                      opacity={0.8}
                      speed={1}
                      density={0.8}
                      fontSize={24}
                    />
                  )}

                  {/* 暂停图标 - 纯展示，点击穿透到 Video */}
                  {playingId !== video.id && index === currentIndex && (
                    <View className={styles.pauseOverlay}>
                      <View className={styles.playIcon} />
                    </View>
                  )}
                </>
              )}

              {/* 右侧操作栏 */}
              <View className={styles.actionBar}>
                {/* 头像 */}
                <View className={styles.avatarWrapper}>
                  <Image
                    className={styles.avatar}
                    src={video.author.avatarUrl}
                    mode="aspectFill"
                    lazyLoad
                  />
                  {!video.author.isFollowed && (
                    <View className={styles.followBtn}>
                      <View className={styles.followIcon} />
                    </View>
                  )}
                </View>

                {/* 点赞 */}
                <View
                  className={styles.actionItem}
                  onClick={() => handleLike(video)}
                >
                  <View className={`${styles.heartIcon} ${video.isLiked ? styles.liked : ''}`} />
                  <Text className={styles.actionCount}>
                    {formatNumber(video.likeCount)}
                  </Text>
                </View>

                {/* 评论 */}
                <View
                  className={styles.actionItem}
                  onClick={() => handleOpenComment(video.id)}
                >
                  <View className={styles.commentIcon} />
                  <Text className={styles.actionCount}>
                    {formatNumber(video.commentCount)}
                  </Text>
                </View>

                {/* 收藏 */}
                <View className={styles.actionItem}>
                  <View className={`${styles.starIcon} ${video.isCollected ? styles.collected : ''}`} />
                  <Text className={styles.actionCount}>
                    {formatNumber(video.collectCount)}
                  </Text>
                </View>

                {/* 分享 */}
                <View
                  className={styles.actionItem}
                  onClick={handleShare}
                >
                  <View className={styles.shareIcon} />
                  <Text className={styles.actionCount}>
                    {formatNumber(video.shareCount)}
                  </Text>
                </View>

                {/* 弹幕开关 - 仅视频类型显示 */}
                {video.type !== 'slideshow' && (
                  <View
                    className={styles.actionItem}
                    onClick={toggleDanmaku}
                  >
                    <View className={`${styles.danmakuIcon} ${danmakuVisible ? styles.active : ''}`} />
                    <Text className={styles.actionCount}>
                      {danmakuVisible ? '弹' : '关'}
                    </Text>
                  </View>
                )}

                {/* 音乐唱片 */}
                <View className={styles.musicDisk}>
                  <Image
                    className={`${styles.diskImage} ${(video.type === 'slideshow' ? index === currentIndex : playingId === video.id) ? styles.spinning : ''}`}
                    src={video.author.avatarUrl}
                    mode="aspectFill"
                  />
                </View>
              </View>

              {/* 底部信息 */}
              <View className={styles.videoInfo}>
                <Text className={styles.authorName}>
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

                {/* 音乐信息 */}
                <View className={styles.musicInfo}>
                  <View className={styles.musicNote} />
                  <Text className={styles.musicName}>
                    {video.musicName || `原声 - ${video.author.nickname}`}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            // 占位符 - 未渲染的视频
            <View className={styles.placeholder} />
          )}
        </SwiperItem>
      ))}
      </Swiper>

      {/* 评论弹窗 */}
      <CommentSheet
        visible={commentVisible}
        videoId={commentVideoId}
        onClose={handleCloseComment}
      />
    </>
  )
}
