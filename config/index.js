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
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      // 添加分析插件（可选）
      if (process.env.ANALYZE === 'true') {
        const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
        chain.plugin('analyzer').use(BundleAnalyzerPlugin)
      }
    },
    // 配置小程序分包
    miniCssExtractPluginOption: {
      ignoreOrder: true
    },
    optimizeMainPackage: {
      enable: true
    }
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
