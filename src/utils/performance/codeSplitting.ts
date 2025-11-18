/**
 * 代码分割与动态导入
 *
 * 【学习要点】
 * 1. 动态import() - 按需加载模块
 * 2. React.lazy - 组件级别懒加载
 * 3. Suspense - 加载状态处理
 * 4. 预加载策略 - 提前加载可能需要的模块
 * 5. 错误边界 - 加载失败处理
 * 6. Webpack魔法注释 - 控制chunk命名
 */

import { ComponentType, lazy, LazyExoticComponent } from 'react'

// ==================== 类型定义 ====================

interface LazyComponentOptions {
  // 最小加载时间，避免闪烁
  minLoadTime?: number
  // 预加载
  preload?: boolean
  // Webpack chunk名称
  chunkName?: string
}

interface PreloadableComponent<T extends ComponentType<any>> {
  Component: LazyExoticComponent<T>
  preload: () => Promise<{ default: T }>
}

// ==================== 懒加载组件 ====================

/**
 * 创建可预加载的懒加载组件
 *
 * @example
 * const { Component: LazyEditor, preload } = createLazyComponent(
 *   () => import('./Editor'),
 *   { chunkName: 'editor', minLoadTime: 300 }
 * )
 *
 * // 预加载
 * preload()
 *
 * // 使用
 * <Suspense fallback={<Loading />}>
 *   <LazyEditor />
 * </Suspense>
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): PreloadableComponent<T> {
  const { minLoadTime = 0, preload = false } = options

  // 包装import函数，添加最小加载时间
  const wrappedImport = async () => {
    const start = Date.now()
    const module = await importFn()
    const elapsed = Date.now() - start

    // 确保最小加载时间，避免闪烁
    if (minLoadTime > 0 && elapsed < minLoadTime) {
      await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsed))
    }

    return module
  }

  // 创建lazy组件
  const Component = lazy(wrappedImport)

  // 预加载函数
  const preloadFn = () => importFn()

  // 自动预加载
  if (preload) {
    // 空闲时预加载
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => preloadFn())
    } else {
      setTimeout(preloadFn, 0)
    }
  }

  return {
    Component,
    preload: preloadFn,
  }
}

// ==================== 模块预加载 ====================

// 已预加载的模块
const preloadedModules = new Set<string>()

/**
 * 预加载模块
 *
 * @example
 * // 在路由切换前预加载
 * preloadModule('video-editor', () => import('./VideoEditor'))
 */
export async function preloadModule(
  name: string,
  importFn: () => Promise<any>
): Promise<void> {
  if (preloadedModules.has(name)) return

  try {
    await importFn()
    preloadedModules.add(name)
    console.log(`[Preload] Module loaded: ${name}`)
  } catch (error) {
    console.error(`[Preload] Failed to load module: ${name}`, error)
  }
}

/**
 * 批量预加载模块
 */
export async function preloadModules(
  modules: Array<{ name: string; importFn: () => Promise<any> }>
): Promise<void> {
  await Promise.allSettled(
    modules.map(({ name, importFn }) => preloadModule(name, importFn))
  )
}

// ==================== 路由级别代码分割 ====================

/**
 * 路由配置类型
 */
interface RouteConfig {
  path: string
  component: () => Promise<{ default: ComponentType<any> }>
  preload?: boolean
}

/**
 * 创建路由级别的懒加载配置
 *
 * @example
 * const routes = createLazyRoutes([
 *   {
 *     path: '/video/edit',
 *     component: () => import('./pages/VideoEdit'),
 *     preload: true,
 *   },
 *   {
 *     path: '/live/room',
 *     component: () => import('./pages/LiveRoom'),
 *   },
 * ])
 */
export function createLazyRoutes(configs: RouteConfig[]) {
  return configs.map(config => {
    const { Component, preload } = createLazyComponent(config.component, {
      preload: config.preload,
    })

    return {
      path: config.path,
      Component,
      preload,
    }
  })
}

// ==================== 功能模块懒加载 ====================

/**
 * 功能模块加载器
 * 用于非组件的大型功能模块
 *
 * @example
 * const videoProcessor = createModuleLoader(
 *   () => import('./utils/videoProcessor')
 * )
 *
 * // 使用时加载
 * const processor = await videoProcessor.load()
 * processor.compress(video)
 */
export function createModuleLoader<T>(
  importFn: () => Promise<{ default: T }>
) {
  let module: T | null = null
  let loading: Promise<T> | null = null

  return {
    // 加载模块
    async load(): Promise<T> {
      if (module) return module

      if (!loading) {
        loading = importFn().then(m => {
          module = m.default
          return module
        })
      }

      return loading
    },

    // 预加载
    preload(): void {
      this.load().catch(() => {})
    },

    // 是否已加载
    isLoaded(): boolean {
      return module !== null
    },
  }
}

// ==================== 条件加载 ====================

/**
 * 条件懒加载
 * 根据条件决定加载哪个模块
 *
 * @example
 * const Editor = createConditionalLazy({
 *   condition: () => isAdvancedUser,
 *   trueComponent: () => import('./AdvancedEditor'),
 *   falseComponent: () => import('./BasicEditor'),
 * })
 */
export function createConditionalLazy<T extends ComponentType<any>>({
  condition,
  trueComponent,
  falseComponent,
}: {
  condition: () => boolean
  trueComponent: () => Promise<{ default: T }>
  falseComponent: () => Promise<{ default: T }>
}): LazyExoticComponent<T> {
  return lazy(async () => {
    const shouldLoadTrue = condition()
    return shouldLoadTrue ? trueComponent() : falseComponent()
  })
}

// ==================== Webpack魔法注释示例 ====================

/**
 * Webpack魔法注释使用示例
 *
 * webpackChunkName: 指定chunk名称
 * webpackPrefetch: 空闲时预取
 * webpackPreload: 与父chunk并行加载
 * webpackMode: 指定加载模式
 */
export const WebpackMagicComments = {
  // 命名chunk
  namedChunk: () => import(/* webpackChunkName: "video-editor" */ '../videoProcessor'),

  // 预取 (空闲时加载)
  prefetch: () => import(/* webpackPrefetch: true */ '../heavyModule'),

  // 预加载 (与当前chunk并行)
  preload: () => import(/* webpackPreload: true */ '../criticalModule'),

  // 弱依赖 (仅当已加载时使用)
  weak: () => import(/* webpackMode: "weak" */ '../optionalModule'),

  // 组合使用
  combined: () => import(
    /* webpackChunkName: "analytics" */
    /* webpackPrefetch: true */
    '../analytics'
  ),
}

// ==================== 加载状态管理 ====================

export interface LoadingState {
  isLoading: boolean
  error: Error | null
  progress: number
}

/**
 * 创建带进度的模块加载器
 */
export function createProgressLoader<T>(
  importFn: () => Promise<{ default: T }>,
  onProgress?: (progress: number) => void
) {
  return async (): Promise<T> => {
    onProgress?.(0)

    // 模拟进度更新
    const progressInterval = setInterval(() => {
      onProgress?.(Math.random() * 50 + 30)
    }, 100)

    try {
      const module = await importFn()
      clearInterval(progressInterval)
      onProgress?.(100)
      return module.default
    } catch (error) {
      clearInterval(progressInterval)
      throw error
    }
  }
}

// ==================== 导出 ====================

export default {
  createLazyComponent,
  preloadModule,
  preloadModules,
  createLazyRoutes,
  createModuleLoader,
  createConditionalLazy,
  createProgressLoader,
}
