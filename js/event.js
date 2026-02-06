export default class EventHub {
    constructor() {
      this.handlers = {
        touchstart: null,
        touchend: null
      }
  
      wx.onTouchStart(e => {
        if (this.handlers.touchstart) this.handlers.touchstart(e)
      })
  
      wx.onTouchEnd(e => {
        if (this.handlers.touchend) this.handlers.touchend(e)
      })
    }
  
    bind(game) {
      this.handlers.touchstart = game.onTouchStart?.bind(game)
      this.handlers.touchend = game.onTouchEnd?.bind(game)
    }
  
    unbind() {
      this.handlers.touchstart = null
      this.handlers.touchend = null
    }
  }
  