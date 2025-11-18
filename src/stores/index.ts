/**
 * Store 统一导出
 */

export { useUserStore } from './userStore'
export { useVideoStore } from './videoStore'
export { useAppStore } from './appStore'

// 新的认证Store
export { useUserStore as useAuthStore, useAuth, useUserInfo } from './user'
