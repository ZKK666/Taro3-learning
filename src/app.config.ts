export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/profile/index'
  ],
  subpackages: [
    {
      root: 'packageVideo',
      name: 'video',
      pages: [
        'pages/feed/index',
        'pages/detail/index',
        'pages/comment/index',
        'pages/user/index'
      ]
    },
    {
      root: 'packageSearch',
      name: 'search',
      pages: [
        'pages/index/index',
        'pages/result/index',
        'pages/topic/index'
      ]
    }
  ],
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['video']
    }
  },
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#000000',
    navigationBarTitleText: '抖音',
    navigationBarTextStyle: 'white',
    backgroundColor: '#000000'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#ffffff',
    backgroundColor: '#000000',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我',
        iconPath: 'assets/tabbar/profile.png',
        selectedIconPath: 'assets/tabbar/profile-active.png'
      }
    ]
  },
  lazyCodeLoading: 'requiredComponents'
})
