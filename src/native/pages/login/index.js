/**
 * 登录页面 - 原生小程序实现
 */

const app = getApp()

Page({
  data: {
    agreed: false
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('auth_token')
    if (token) {
      // 已登录，返回上一页或首页
      this.navigateBack()
    }
  },

  // 微信登录
  handleWechatLogin(e) {
    if (!this.data.agreed) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    if (e.detail.userInfo) {
      wx.showLoading({ title: '登录中...' })

      // 获取登录 code
      wx.login({
        success: (res) => {
          if (res.code) {
            // 模拟登录请求
            this.mockLogin(res.code, e.detail.userInfo)
          } else {
            wx.hideLoading()
            wx.showToast({
              title: '登录失败',
              icon: 'none'
            })
          }
        },
        fail: () => {
          wx.hideLoading()
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
        }
      })
    }
  },

  // 模拟登录
  mockLogin(code, userInfo) {
    // 模拟网络延迟
    setTimeout(() => {
      // Mock 登录成功
      const mockToken = 'mock_token_' + Date.now()
      const mockUserInfo = {
        id: 'current_user',
        nickname: userInfo.nickName || '微信用户',
        avatarUrl: userInfo.avatarUrl || '',
        gender: userInfo.gender || 0
      }

      // 存储 token 和用户信息
      wx.setStorageSync('auth_token', mockToken)
      wx.setStorageSync('user_info', JSON.stringify(mockUserInfo))

      wx.hideLoading()
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 返回上一页
      setTimeout(() => {
        this.navigateBack()
      }, 1500)
    }, 1000)
  },

  // 手机号登录
  handlePhoneLogin() {
    if (!this.data.agreed) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    wx.showToast({
      title: '暂未开放',
      icon: 'none'
    })
  },

  // QQ 登录
  handleQQLogin() {
    wx.showToast({
      title: '暂未开放',
      icon: 'none'
    })
  },

  // 微博登录
  handleWeiboLogin() {
    wx.showToast({
      title: '暂未开放',
      icon: 'none'
    })
  },

  // 切换协议同意状态
  toggleAgreement() {
    this.setData({
      agreed: !this.data.agreed
    })
  },

  // 显示用户协议
  showUserAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '这里是用户协议内容...',
      showCancel: false
    })
  },

  // 显示隐私政策
  showPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '这里是隐私政策内容...',
      showCancel: false
    })
  },

  // 游客模式
  handleGuestMode() {
    this.navigateBack()
  },

  // 返回上一页
  navigateBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  }
})
