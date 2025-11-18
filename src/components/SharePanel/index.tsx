/**
 * 分享面板组件
 */

import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

interface SharePanelProps {
  visible: boolean
  onClose: () => void
  shareData: {
    title: string
    path: string
    imageUrl?: string
  }
}

export default function SharePanel({ visible, onClose, shareData }: SharePanelProps) {
  if (!visible) return null

  // 分享到微信好友
  const handleShareWechat = () => {
    // 小程序分享通过 onShareAppMessage 实现
    Taro.showToast({
      title: '请点击右上角分享',
      icon: 'none'
    })
  }

  // 分享到朋友圈
  const handleShareTimeline = () => {
    Taro.showToast({
      title: '请点击右上角分享到朋友圈',
      icon: 'none'
    })
  }

  // 复制链接
  const handleCopyLink = () => {
    Taro.setClipboardData({
      data: `https://example.com${shareData.path}`,
      success: () => {
        Taro.showToast({
          title: '链接已复制',
          icon: 'success'
        })
        onClose()
      }
    })
  }

  // 保存图片/海报
  const handleSavePoster = () => {
    if (shareData.imageUrl) {
      Taro.saveImageToPhotosAlbum({
        filePath: shareData.imageUrl,
        success: () => {
          Taro.showToast({
            title: '已保存到相册',
            icon: 'success'
          })
          onClose()
        },
        fail: () => {
          Taro.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      })
    }
  }

  // 举报
  const handleReport = () => {
    Taro.showActionSheet({
      itemList: ['内容违规', '侵犯版权', '虚假信息', '其他'],
      success: (res) => {
        Taro.showToast({
          title: '举报已提交',
          icon: 'success'
        })
        onClose()
      }
    })
  }

  // 不感兴趣
  const handleNotInterested = () => {
    Taro.showToast({
      title: '将减少此类推荐',
      icon: 'none'
    })
    onClose()
  }

  return (
    <View className={styles.overlay} onClick={onClose}>
      <View className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* 分享目标 */}
        <View className={styles.shareTargets}>
          <View className={styles.shareItem} onClick={handleShareWechat}>
            <View className={styles.shareIcon} style={{ backgroundColor: '#07c160' }}>
              <Text>微</Text>
            </View>
            <Text className={styles.shareLabel}>微信好友</Text>
          </View>
          <View className={styles.shareItem} onClick={handleShareTimeline}>
            <View className={styles.shareIcon} style={{ backgroundColor: '#07c160' }}>
              <Text>圈</Text>
            </View>
            <Text className={styles.shareLabel}>朋友圈</Text>
          </View>
          <View className={styles.shareItem} onClick={handleCopyLink}>
            <View className={styles.shareIcon} style={{ backgroundColor: '#666' }}>
              <Text>🔗</Text>
            </View>
            <Text className={styles.shareLabel}>复制链接</Text>
          </View>
          <View className={styles.shareItem} onClick={handleSavePoster}>
            <View className={styles.shareIcon} style={{ backgroundColor: '#666' }}>
              <Text>💾</Text>
            </View>
            <Text className={styles.shareLabel}>保存本地</Text>
          </View>
        </View>

        {/* 操作选项 */}
        <View className={styles.actions}>
          <View className={styles.actionItem} onClick={handleNotInterested}>
            <Text className={styles.actionIcon}>🚫</Text>
            <Text className={styles.actionLabel}>不感兴趣</Text>
          </View>
          <View className={styles.actionItem} onClick={handleReport}>
            <Text className={styles.actionIcon}>⚠️</Text>
            <Text className={styles.actionLabel}>举报</Text>
          </View>
        </View>

        {/* 取消按钮 */}
        <View className={styles.cancelBtn} onClick={onClose}>
          <Text>取消</Text>
        </View>
      </View>
    </View>
  )
}
