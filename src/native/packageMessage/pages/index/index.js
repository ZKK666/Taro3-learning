/**
 * 消息中心页面 - 原生小程序实现
 */

Page({
  data: {
    // 未读数量
    unreadCount: {
      total: 0,
      like: 0,
      comment: 0,
      follow: 0,
      system: 0
    },
    // 预览消息
    previews: {
      like: null,
      comment: null,
      follow: null,
      system: null
    },
    // 最近消息列表
    recentMessages: []
  },

  onLoad() {
    this.fetchMessageCenter()
  },

  onShow() {
    // 页面显示时刷新数据
    this.fetchMessageCenter()
  },

  // 获取消息中心数据
  fetchMessageCenter() {
    // Mock 数据
    const mockData = {
      unreadCount: {
        total: 10,
        like: 4,
        comment: 3,
        follow: 2,
        system: 1
      },
      previews: {
        like: {
          user: {
            nickname: '小红薯创作者',
            avatarUrl: 'https://picsum.photos/200/200?random=1'
          }
        },
        comment: {
          user: {
            nickname: '美食达人阿强',
            avatarUrl: 'https://picsum.photos/200/200?random=2'
          },
          content: '这个视频太棒了！'
        },
        follow: {
          user: {
            nickname: '舞蹈小王子',
            avatarUrl: 'https://picsum.photos/200/200?random=3'
          }
        },
        system: {
          title: '账号安全提醒'
        }
      }
    }

    // Mock 最近消息
    const recentMessages = [
      {
        id: '1',
        type: 'comment',
        user: {
          nickname: '美食达人阿强',
          avatarUrl: 'https://picsum.photos/200/200?random=2'
        },
        previewText: '这个视频太棒了，学到了很多！',
        video: {
          coverUrl: 'https://picsum.photos/200/200?random=v1'
        },
        isRead: false,
        timeText: '刚刚'
      },
      {
        id: '2',
        type: 'like',
        user: {
          nickname: '旅行家小美',
          avatarUrl: 'https://picsum.photos/200/200?random=4'
        },
        previewText: '赞了你的视频',
        video: {
          coverUrl: 'https://picsum.photos/200/200?random=v2'
        },
        isRead: false,
        timeText: '5分钟前'
      },
      {
        id: '3',
        type: 'follow',
        user: {
          nickname: '知识分享官',
          avatarUrl: 'https://picsum.photos/200/200?random=5'
        },
        previewText: '关注了你',
        video: null,
        isRead: true,
        timeText: '1小时前'
      },
      {
        id: '4',
        type: 'comment',
        user: {
          nickname: '健身教练Leo',
          avatarUrl: 'https://picsum.photos/200/200?random=7'
        },
        previewText: '回复了你：好的，下次试试这个方法',
        video: {
          coverUrl: 'https://picsum.photos/200/200?random=v3'
        },
        isRead: true,
        timeText: '3小时前'
      }
    ]

    this.setData({
      ...mockData,
      recentMessages
    })
  },

  // 跳转到点赞列表
  goToLikes() {
    wx.navigateTo({
      url: '/packageMessage/pages/likes/index'
    })
  },

  // 跳转到评论列表
  goToComments() {
    wx.navigateTo({
      url: '/packageMessage/pages/comments/index'
    })
  },

  // 跳转到粉丝列表
  goToFollowers() {
    wx.navigateTo({
      url: '/packageMessage/pages/followers/index'
    })
  },

  // 跳转到系统通知
  goToSystem() {
    wx.navigateTo({
      url: '/packageMessage/pages/system/index'
    })
  },

  // 跳转到消息详情
  goToMessageDetail(e) {
    const message = e.currentTarget.dataset.message

    switch (message.type) {
      case 'like':
        this.goToLikes()
        break
      case 'comment':
        this.goToComments()
        break
      case 'follow':
        this.goToFollowers()
        break
      default:
        break
    }
  }
})
