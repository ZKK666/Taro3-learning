export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/friends/index',
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
        'pages/user/index',
        'pages/music/index'
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
    },
    {
      root: 'packageLive',
      name: 'live',
      pages: [
        'pages/list/index',
        'pages/room/index'
      ]
    },
    {
      root: 'packageCreator',
      name: 'creator',
      pages: [
        'pages/index/index',
        'pages/works/index',
        'pages/fans/index',
        'pages/inspiration/index'
      ]
    },
    {
      root: 'packageSettings',
      name: 'settings',
      pages: [
        'pages/index/index',
        'pages/account/index',
        'pages/privacy/index',
        'pages/notification/index',
        'pages/general/index',
        'pages/about/index',
        'pages/edit-profile/index'
      ]
    },
    {
      root: 'packageChat',
      name: 'chat',
      pages: [
        'pages/list/index',
        'pages/conversation/index'
      ]
    }
  ],
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['video']
    },
    'pages/profile/index': {
      network: 'wifi',
      packages: ['settings', 'creator']
    },
    'pages/friends/index': {
      network: 'wifi',
      packages: ['chat']
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
    custom: false,
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
        pagePath: 'pages/friends/index',
        text: '朋友',
        iconPath: 'assets/tabbar/friends.png',
        selectedIconPath: 'assets/tabbar/friends-active.png'
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
