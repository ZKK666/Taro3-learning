/**
 * 应用入口组件
 *
 * 负责应用初始化，包括：
 * 1. 初始化用户登录状态
 * 2. 自动Token刷新
 */

import { PropsWithChildren, useEffect } from 'react'
import { useLaunch } from '@tarojs/taro'
import { useUserStore } from '@/stores/user'
import './app.scss'

function App({ children }: PropsWithChildren) {
  // 获取初始化方法
  const initialize = useUserStore((state) => state.initialize)

  useLaunch(() => {
    console.log('App launched.')

    // 初始化用户登录状态
    // 从本地存储恢复Token和用户信息
    initialize().then(() => {
      console.log('Auth initialized.')
    }).catch((error) => {
      console.error('Auth initialization failed:', error)
    })
  })

  // children 是将要会渲染的页面
  return children
}

export default App
