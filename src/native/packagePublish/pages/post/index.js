/**
 * 视频发布页面 - 原生小程序实现
 */

Page({
  data: {
    // 视频信息
    videoPath: '',
    coverPath: '',

    // 表单数据
    title: '',
    selectedTopics: [],
    atUsers: [],
    location: null,
    visibility: 'public',
    visibilityText: '公开',

    // UI 状态
    publishing: false,
    showVisibilityPicker: false
  },

  onLoad(options) {
    // 获取传递的视频路径
    if (options.videoPath) {
      this.setData({
        videoPath: decodeURIComponent(options.videoPath),
        coverPath: decodeURIComponent(options.coverPath || options.videoPath)
      })
    }
  },

  // 标题输入
  handleTitleInput(e) {
    this.setData({
      title: e.detail.value
    })
  },

  // 更换封面
  handleChangeCover() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        this.setData({
          coverPath: res.tempFiles[0].tempFilePath
        })
      }
    })
  },

  // 选择话题
  handleSelectTopic() {
    // TODO: 跳转话题选择页面
    // 这里模拟选择话题
    const mockTopics = [
      { id: '1', name: '舞蹈挑战' },
      { id: '2', name: '日常vlog' }
    ]
    this.setData({
      selectedTopics: mockTopics
    })
  },

  // @好友
  handleAtFriends() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 选择位置
  handleSelectLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          }
        })
      },
      fail: (err) => {
        if (err.errMsg.indexOf('auth deny') !== -1) {
          wx.showModal({
            title: '提示',
            content: '需要授权位置信息才能添加位置',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting()
              }
            }
          })
        }
      }
    })
  },

  // 选择可见范围
  handleSelectVisibility() {
    this.setData({
      showVisibilityPicker: true
    })
  },

  // 隐藏可见范围选择器
  hideVisibilityPicker() {
    this.setData({
      showVisibilityPicker: false
    })
  },

  // 阻止事件冒泡
  stopPropagation() {},

  // 选择可见范围
  selectVisibility(e) {
    const value = e.currentTarget.dataset.value
    const textMap = {
      public: '公开',
      friends: '朋友可见',
      private: '私密'
    }
    this.setData({
      visibility: value,
      visibilityText: textMap[value],
      showVisibilityPicker: false
    })
  },

  // 高级设置
  handleAdvancedSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 存草稿
  handleSaveDraft() {
    const draft = {
      videoPath: this.data.videoPath,
      coverPath: this.data.coverPath,
      title: this.data.title,
      selectedTopics: this.data.selectedTopics,
      visibility: this.data.visibility,
      createTime: Date.now()
    }

    // 存储草稿
    const drafts = wx.getStorageSync('video_drafts') || []
    drafts.unshift(draft)
    wx.setStorageSync('video_drafts', drafts)

    wx.showToast({
      title: '已存至草稿',
      icon: 'success'
    })

    // 返回上一页
    setTimeout(() => {
      wx.navigateBack({ delta: 2 })
    }, 1500)
  },

  // 发布视频
  handlePublish() {
    if (this.data.publishing) return

    // 验证
    if (!this.data.title.trim()) {
      wx.showToast({
        title: '请添加作品描述',
        icon: 'none'
      })
      return
    }

    this.setData({ publishing: true })

    // 模拟发布过程
    wx.showLoading({
      title: '发布中...',
      mask: true
    })

    // 模拟上传延迟
    setTimeout(() => {
      wx.hideLoading()

      // 模拟发布成功
      const success = Math.random() > 0.1

      if (success) {
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        })

        // 返回首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      } else {
        this.setData({ publishing: false })
        wx.showToast({
          title: '发布失败，请重试',
          icon: 'none'
        })
      }
    }, 2000)
  }
})
