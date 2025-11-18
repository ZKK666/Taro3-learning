const path = require('path')

const config = {
  projectName: 'taro-short-video',
  date: '2024-1-1',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1
  },
  sourceRoot: 'src',
  outputRoot: `dist/${process.env.TARO_ENV}`,
  plugins: [],
  defineConstants: {
  },
  copy: {
    patterns: [
      // 复制原生页面到输出目录
      { from: 'src/native/', to: 'dist/weapp/', ignore: ['*.ts'] }
    ],
    options: {
    }
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false
    }
  },
  cache: {
    enable: false
  },
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
    '@components': path.resolve(__dirname, '..', 'src/components'),
    '@stores': path.resolve(__dirname, '..', 'src/stores'),
    '@services': path.resolve(__dirname, '..', 'src/services'),
    '@utils': path.resolve(__dirname, '..', 'src/utils'),
    '@hooks': path.resolve(__dirname, '..', 'src/hooks'),
    '@types': path.resolve(__dirname, '..', 'src/types'),
    '@constants': path.resolve(__dirname, '..', 'src/constants'),
    '@assets': path.resolve(__dirname, '..', 'src/assets'),
    '@mock': path.resolve(__dirname, '..', 'src/mock')
  },
  sass: {
    resource: [
      'src/assets/styles/variables.scss',
      'src/assets/styles/mixins.scss'
    ]
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {

        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          /**
           * 【学习要点】CSS 类名压缩
           *
           * 生产环境使用短哈希类名，可以减少 WXSS 文件大小
           * - 开发环境: [name]__[local]___[hash:base64:5] => Button__primary___x3k2j
           * - 生产环境: [hash:base64:4] => x3k2
           *
           * 节省空间：类名从 ~30 字符压缩到 4 字符
           */
          generateScopedName: process.env.NODE_ENV === 'production'
            ? '[hash:base64:4]'
            : '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      /**
       * 【学习要点】Webpack 优化配置
       *
       * 这些配置帮助减小打包体积：
       * 1. Tree Shaking - 移除未使用的代码
       * 2. 代码压缩 - Terser 压缩 JS
       * 3. 依赖分析 - Bundle Analyzer
       */

      // 添加分析插件（可选）
      if (process.env.ANALYZE === 'true') {
        const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
        chain.plugin('analyzer').use(BundleAnalyzerPlugin)
      }

      // 生产环境优化
      if (process.env.NODE_ENV === 'production') {
        /**
         * 【学习要点】Tree Shaking 配置
         *
         * usedExports: 标记未使用的导出
         * sideEffects: 允许移除无副作用的模块
         *
         * 前提条件：
         * - 使用 ES6 模块 (import/export)
         * - package.json 中设置 "sideEffects": false
         */
        chain.optimization.usedExports(true)

        /**
         * 【学习要点】Terser 压缩配置
         *
         * drop_console: 移除 console.log（生产环境不需要）
         * drop_debugger: 移除 debugger 语句
         * pure_funcs: 移除指定的纯函数调用
         *
         * 注意：需要检查 minimizer 是否存在
         */
        if (chain.optimization.minimizers.has('terser')) {
          chain.optimization.minimizer('terser').tap(args => {
            if (args[0] && args[0].terserOptions) {
              args[0].terserOptions.compress = {
                ...args[0].terserOptions.compress,
                drop_console: true,      // 移除 console
                drop_debugger: true,     // 移除 debugger
                pure_funcs: ['console.info', 'console.debug'] // 移除特定函数
              }
            }
            return args
          })
        }
      }
    },
    /**
     * 【学习要点】小程序特有优化
     */
    // 配置小程序分包
    miniCssExtractPluginOption: {
      ignoreOrder: true  // 忽略 CSS 顺序警告，避免不必要的警告信息
    },
    /**
     * 【学习要点】主包优化
     *
     * 自动将分包中共用的模块提取到主包
     * 避免每个分包都打包一份相同的代码
     */
    optimizeMainPackage: {
      enable: true
    },
    /**
     * 【学习要点】WXML 压缩
     *
     * 注意：minifyXML 在某些 Taro 版本中可能导致 input 标签闭合问题
     * 如果遇到 "expect end-tag `input`" 错误，请禁用此选项
     *
     * minifyXML: {
     *   collapseWhitespace: true
     * }
     */
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['taro-ui'],
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
        }
      },
      cssModules: {
        enable: true,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@tarojs/components$', '@tarojs/components/dist-h5/react')
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
