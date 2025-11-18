/**
 * 登录页面
 *
 * 企业级登录模块的核心页面，支持多种登录方式
 *
 * 【功能特点】
 * 1. 手机号+验证码登录（推荐）
 * 2. 手机号+密码登录
 * 3. 微信一键登录
 * 4. 自动填充记住的手机号
 * 5. 验证码倒计时
 * 6. 表单验证
 * 7. 登录成功后跳转
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useUserStore } from '@/stores/user'
import { authService } from '@/services/auth'
import {
  validatePhone,
  validateCode,
  getRememberedPhone,
  navigateAfterLogin,
} from '@/utils/auth'
import { testAccounts } from '@/mock/user'
import styles from './index.module.scss'

/**
 * 登录方式类型
 */
type LoginMode = 'code' | 'password'

/**
 * 登录页面组件
 */
export default function LoginPage() {
  // 路由参数，获取登录后跳转地址
  const router = useRouter()
  const redirectUrl = decodeURIComponent(router.params.redirect || '')

  // 从Store获取登录方法和状态
  const { login, isLoading, isLoggedIn } = useUserStore()

  // ==================== 状态管理 ====================

  // 登录方式：验证码/密码
  const [loginMode, setLoginMode] = useState<LoginMode>('code')

  // 表单数据
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')

  // 密码显示/隐藏
  const [showPassword, setShowPassword] = useState(false)

  // 验证码倒计时
  const [countdown, setCountdown] = useState(0)
  const [isSendingCode, setIsSendingCode] = useState(false)

  // ==================== 生命周期 ====================

  // 初始化：自动填充记住的手机号
  useEffect(() => {
    const rememberedPhone = getRememberedPhone()
    if (rememberedPhone) {
      setPhone(rememberedPhone)
    }
  }, [])

  // 如果已登录，直接跳转
  useEffect(() => {
    if (isLoggedIn) {
      navigateAfterLogin(redirectUrl)
    }
  }, [isLoggedIn, redirectUrl])

  // 验证码倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // ==================== 表单验证 ====================

  /**
   * 检查表单是否可提交
   */
  const canSubmit = useCallback(() => {
    if (!validatePhone(phone)) return false

    if (loginMode === 'code') {
      return validateCode(code)
    } else {
      return password.length >= 6
    }
  }, [phone, code, password, loginMode])

  // ==================== 事件处理 ====================

  /**
   * 发送验证码
   */
  const handleSendCode = async () => {
    // 验证手机号
    if (!validatePhone(phone)) {
      Taro.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
      })
      return
    }

    // 防止重复发送
    if (countdown > 0 || isSendingCode) return

    try {
      setIsSendingCode(true)

      // 调用发送验证码API
      await authService.sendCode({
        phone,
        type: 'login',
      })

      // 开始倒计时
      setCountdown(60)

      Taro.showToast({
        title: '验证码已发送',
        icon: 'success',
      })
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '发送失败',
        icon: 'none',
      })
    } finally {
      setIsSendingCode(false)
    }
  }

  /**
   * 处理登录
   */
  const handleLogin = async () => {
    if (!canSubmit() || isLoading) return

    try {
      if (loginMode === 'code') {
        // 验证码登录
        await login({
          type: 'phone_code',
          phone,
          code,
        })
      } else {
        // 密码登录
        await login({
          type: 'phone_password',
          phone,
          password,
        })
      }

      // 登录成功，跳转
      setTimeout(() => {
        navigateAfterLogin(redirectUrl)
      }, 500)
    } catch (error) {
      // 错误已在store中处理
      console.error('登录失败:', error)
    }
  }

  /**
   * 微信一键登录
   */
  const handleWechatLogin = async () => {
    try {
      // 获取微信登录code
      const wxCode = await authService.getWxLoginCode()

      // 尝试获取用户信息（可能需要用户授权）
      let userInfo
      try {
        userInfo = await authService.getWxUserProfile()
      } catch (e) {
        // 用户拒绝授权，仍可继续登录
        console.log('用户未授权获取信息')
      }

      // 调用微信登录
      await login({
        type: 'wechat',
        code: wxCode,
        userInfo,
      })

      // 登录成功，跳转
      setTimeout(() => {
        navigateAfterLogin(redirectUrl)
      }, 500)
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '微信登录失败',
        icon: 'none',
      })
    }
  }

  /**
   * 填充测试账号
   */
  const handleFillTestAccount = (account: typeof testAccounts[0]) => {
    setPhone(account.phone)
    if (loginMode === 'code') {
      setCode(account.code)
    } else {
      setPassword(account.password)
    }
  }

  // ==================== 渲染 ====================

  return (
    <View className={styles.container}>
      {/* 头部Logo */}
      <View className={styles.header}>
        <View className={styles.logo} />
        <View className={styles.title}>抖音</View>
        <View className={styles.subtitle}>记录美好生活</View>
      </View>

      {/* 登录方式切换 */}
      <View className={styles.loginTabs}>
        <View
          className={`${styles.tab} ${loginMode === 'code' ? styles.tabActive : ''}`}
          onClick={() => setLoginMode('code')}
        >
          验证码登录
        </View>
        <View
          className={`${styles.tab} ${loginMode === 'password' ? styles.tabActive : ''}`}
          onClick={() => setLoginMode('password')}
        >
          密码登录
        </View>
      </View>

      {/* 登录表单 */}
      <View className={styles.form}>
        {/* 手机号输入 */}
        <View className={styles.inputGroup}>
          <Text className={styles.label}>手机号</Text>
          <View className={styles.inputWrapper}>
            <Input
              className={styles.input}
              type="number"
              placeholder="请输入手机号"
              placeholderStyle="color: rgba(255, 255, 255, 0.3)"
              maxlength={11}
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
            />
          </View>
        </View>

        {/* 验证码/密码输入 */}
        {loginMode === 'code' ? (
          <View className={styles.inputGroup}>
            <Text className={styles.label}>验证码</Text>
            <View className={styles.inputWrapper}>
              <Input
                className={`${styles.input} ${styles.codeInput}`}
                type="number"
                placeholder="请输入验证码"
                placeholderStyle="color: rgba(255, 255, 255, 0.3)"
                maxlength={6}
                value={code}
                onInput={(e) => setCode(e.detail.value)}
              />
              <Text
                className={`${styles.codeBtn} ${
                  countdown > 0 || isSendingCode ? styles.codeBtnDisabled : ''
                }`}
                onClick={handleSendCode}
              >
                {countdown > 0 ? `${countdown}s` : isSendingCode ? '发送中...' : '获取验证码'}
              </Text>
            </View>
          </View>
        ) : (
          <View className={styles.inputGroup}>
            <Text className={styles.label}>密码</Text>
            <View className={styles.inputWrapper}>
              <Input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码"
                placeholderStyle="color: rgba(255, 255, 255, 0.3)"
                maxlength={20}
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
              />
              <Text
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '隐藏' : '显示'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 登录按钮 */}
      <View
        className={`${styles.loginBtn} ${
          !canSubmit() || isLoading ? styles.loginBtnDisabled : ''
        }`}
        onClick={handleLogin}
      >
        {isLoading ? (
          <View className={styles.loading}>
            <View className={styles.spinner} />
            <Text>登录中...</Text>
          </View>
        ) : (
          '登录'
        )}
      </View>

      {/* 分割线 */}
      <View className={styles.divider}>
        <View className={styles.dividerLine} />
        <Text className={styles.dividerText}>其他登录方式</Text>
        <View className={styles.dividerLine} />
      </View>

      {/* 微信登录 */}
      <View className={styles.wechatBtn} onClick={handleWechatLogin}>
        <View className={styles.wechatIcon} />
        微信一键登录
      </View>

      {/* 测试账号提示 */}
      <View className={styles.testAccount}>
        <View className={styles.testTitle}>测试账号（点击自动填充）</View>
        {testAccounts.map((account) => (
          <View
            key={account.phone}
            className={styles.testItem}
            onClick={() => handleFillTestAccount(account)}
          >
            <View className={styles.testInfo}>
              {account.description}
              <Text className={styles.testPhone}>{account.phone}</Text>
            </View>
            <Text className={styles.testFill}>填充</Text>
          </View>
        ))}
        <View className={styles.testInfo} style={{ marginTop: '8px', fontSize: '11px' }}>
          密码/验证码均为：123456
        </View>
      </View>

      {/* 用户协议 */}
      <View className={styles.agreement}>
        <Text className={styles.agreementText}>
          登录即表示同意
          <Text className={styles.agreementLink}>《用户协议》</Text>和
          <Text className={styles.agreementLink}>《隐私政策》</Text>
        </Text>
      </View>
    </View>
  )
}
