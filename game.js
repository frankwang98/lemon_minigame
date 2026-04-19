import Main from './js/main';

// new Main();

wx.showShareMenu({
  menus: ['shareAppMessage', 'shareTimeline']
})

wx.onShareAppMessage(function () {
  return {
    title: '快来玩这个小游戏！',        // 分享标题
    imageUrl: 'images/lemon1.jpg',    // 分享图片，建议比例5:4
    query: 'from=share'              // 携带的参数
  }
})

wx.onShareTimeline(function () {
  return {
    title: '快来一起挑战高分！',
    imageUrl: 'images/lemon1.jpg'
  }
})

function onShareButtonClick() {
  wx.shareAppMessage({
    title: '我打过了第5关，你能超越我吗？',
    imageUrl: 'images/lemon1.jpg'
  })
}