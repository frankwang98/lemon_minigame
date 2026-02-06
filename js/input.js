// src/input.js
export class InputManager {
  constructor(canvas, renderer, uiManager, gameState, onStateChanged, onUseTool) {
    this.canvas = canvas
    this.renderer = renderer
    this.ui = uiManager
    this.state = gameState
    this.onStateChanged = onStateChanged
    this.onUseTool = onUseTool

    this.currentTool = null // 'swap' | 'bomb' | 'shuffle'
    this.bindEvents()
  }

  bindEvents() {
    wx.onTouchStart(this.handleTouchStart.bind(this))
  }

  handleTouchStart(e) {
    const touch = e.touches[0]
    const x = touch.clientX
    const y = touch.clientY

    // 按钮点击
    const btn = this.ui.hitTestButton(x, y)
    if (btn) {
      this.handleButton(btn.id)
      return
    }

    // 未开始游戏不能操作棋盘
    if (this.state.gamePhase !== 'playing') return

    // 棋盘点击
    const cell = this.renderer.pointToCell(x, y)
    if (!cell) return

    // 使用爆破道具
    if (this.currentTool === 'bomb') {
      if (this.state.tools.bomb > 0) {
        this.state.tools.bomb--
        this.onUseTool('bomb', cell)
      } else {
        this.state.requestToolByShare('bomb')
      }
      this.currentTool = null
      this.onStateChanged()
      return
    }

    // 使用换位道具
    if (this.currentTool === 'swap') {
      if (!this.state.selectedCell) {
        this.state.selectedCell = cell
        this.onStateChanged()
        return
      } else {
        if (this.state.tools.swap > 0) {
          this.state.tools.swap--
          this.onUseTool('swap', { a: this.state.selectedCell, b: cell })
        } else {
          this.state.requestToolByShare('swap')
        }
        this.state.selectedCell = null
        this.currentTool = null
        this.onStateChanged()
        return
      }
    }

    // 普通点击（正常三消）
    const prev = this.state.selectedCell
    const now = Date.now()

    if (!prev) {
      this.state.selectedCell = cell
      this.onStateChanged()
    } else {
      if (prev.col === cell.col && prev.row === cell.row) {
        this.state.selectedCell = null
        this.onStateChanged()
      } else {
        const success = this.state.trySwapAndResolve(prev, cell, now)
        this.state.selectedCell = null
        this.onStateChanged(success)
      }
    }
  }

  handleButton(id) {
    // ⭐ 开始游戏
    if (id === 'startGame') {
      this.state.gamePhase = 'playing'
      this.onStateChanged()
      return
    }

    // ⭐ 下一关
    if (id === 'nextLevel') {
      const next = Math.min(this.state.levelIndex + 1, 9)
      this.state.loadLevel(next)
      this.onStateChanged()
      return
    }

    // ⭐ 重试
    if (id === 'restart') {
      this.state.loadLevel(this.state.levelIndex)
      this.onStateChanged()
      return
    }

    // ⭐ 分享获得道具
    if (id === 'shareTool') {
      this.state.requestToolByShare('shuffle') // 默认给刷新
      this.onStateChanged()
      return
    }

    // ⭐ 道具：刷新
    if (id === 'tool_shuffle') {
      if (this.state.tools.shuffle > 0) {
        this.state.tools.shuffle--
        this.onUseTool('shuffle')
      } else {
        this.state.requestToolByShare('shuffle')
      }
      this.onStateChanged()
      return
    }

    // ⭐ 道具：爆破
    if (id === 'tool_bomb') {
      this.currentTool = 'bomb'
      return
    }

    // ⭐ 道具：换位
    if (id === 'tool_swap') {
      this.currentTool = 'swap'
      return
    }
  }
}
