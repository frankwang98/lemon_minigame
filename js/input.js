// src/input.js

export class InputManager {
    constructor(canvas, renderer, gameState, onStateChanged) {
      this.canvas = canvas
      this.renderer = renderer
      this.state = gameState
      this.onStateChanged = onStateChanged
  
      this.bindEvents()
    }
  
    bindEvents() {
      wx.onTouchStart(this.handleTouchStart.bind(this))
    }
  
    handleTouchStart(e) {
      const touch = e.touches[0]
      const x = touch.clientX
      const y = touch.clientY
  
      const cell = this.renderer.pointToCell(x, y)
      if (!cell) return
  
      const prev = this.state.selectedCell
      if (!prev) {
        // 第一次选中
        this.state.selectedCell = cell
        this.onStateChanged()
      } else {
        // 第二次点击：如果是同一个格子，则取消；如果相邻则尝试交换
        if (prev.col === cell.col && prev.row === cell.row) {
          this.state.selectedCell = null
          this.onStateChanged()
        } else {
          const success = this.state.trySwapAndResolve(prev, cell)
          this.state.selectedCell = null
          if (success) {
            this.onStateChanged()
          } else {
            // 不成功也要刷新一下选中状态
            this.onStateChanged()
          }
        }
      }
    }
  }
  