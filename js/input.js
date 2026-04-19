// src/input.js
import { LEVELS } from './levels.js'

export class InputManager {
  constructor(canvas, renderer, uiManager, gameState, onStateChanged, onUseTool) {
    this.canvas = canvas
    this.renderer = renderer
    this.ui = uiManager
    this.state = gameState
    this.onStateChanged = onStateChanged
    this.onUseTool = onUseTool

    this.currentTool = null // 'swap' | 'bomb' | 'shuffle'

    // 拖动相关
    this.dragging = false
    this.startCell = null
    this.startX = 0
    this.startY = 0

    // 调试后门
    this.quickClickCount = 0
    this.lastQuickClick = 0

    this.bindEvents()
  }

  bindEvents() {
    wx.onTouchStart(this.handleTouchStart.bind(this))
    wx.onTouchMove(this.handleTouchMove.bind(this))
    wx.onTouchEnd(this.handleTouchEnd.bind(this))
  }

  handleTouchStart(e) {
    const touch = e.touches[0]
    const x = touch.clientX
    const y = touch.clientY

    // 按钮点击
    const btn = this.ui.hitTestButton(x, y)
    if (btn) {
      audioSystem.click()
      this.handleButton(btn.id)
      return
    }

    // 静音按钮
    if (this.hitSoundButton(x, y)) {
      // 调试后门：500ms 内快速点击 3 次跳到下一关
      if (!this.quickClickCount) this.quickClickCount = 0
      if (Date.now() - this.lastQuickClick < 500) {
        this.quickClickCount++
      } else {
        this.quickClickCount = 0
      }
      this.lastQuickClick = Date.now()
      if (this.quickClickCount >= 2) {
        const next = Math.min(this.state.levelIndex + 1, LEVELS.length - 1)
        this.state.loadLevel(next)
        this.state.gamePhase = 'playing'
        this.quickClickCount = 0
        return
      }
      // 正常切换音乐
      globalThis.audio.toggleMusic()
      audioSystem.click()
      return
    }

    // 未开始游戏不能操作棋盘
    if (this.state.gamePhase !== 'playing') return

    const cell = this.renderer.pointToCell(x, y)
    if (!cell) return

    // 道具：爆破
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

    // 道具：换位（点击两次）
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

    // 普通三消：开始拖动
    this.dragging = true
    this.startCell = cell
    this.startX = x
    this.startY = y

    this.state.draggingCell = cell
    this.state.dragOffsetX = 0
    this.state.dragOffsetY = 0
    this.state.dragDirection = null

    audioSystem.click()
  }

  handleTouchMove(e) {
    if (!this.dragging || !this.startCell) return

    const touch = e.touches[0]
    const x = touch.clientX
    const y = touch.clientY

    const dx = x - this.startX
    const dy = y - this.startY

    this.state.dragOffsetX = dx
    this.state.dragOffsetY = dy

    const threshold = 20
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return

    let dir = null
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx > 0 ? 'right' : 'left'
    } else {
      dir = dy > 0 ? 'down' : 'up'
    }
    this.state.dragDirection = dir

    const target = this.state.getNeighbor(this.startCell, dir)
    if (!target) return

    const now = Date.now()
    const success = this.state.trySwapAndResolve(this.startCell, target, now)

    this.dragging = false
    this.startCell = null
    this.state.draggingCell = null
    this.state.dragOffsetX = 0
    this.state.dragOffsetY = 0
    this.state.dragDirection = null

    this.onStateChanged(success)
  }

  handleTouchEnd() {
    this.dragging = false
    this.startCell = null
    this.state.draggingCell = null
    this.state.dragOffsetX = 0
    this.state.dragOffsetY = 0
    this.state.dragDirection = null
  }

  hitSoundButton(x, y) {
    const bx = this.ui.width - 60
    const by = 100
    const bw = 40
    const bh = 40

    return x >= bx && x <= bx + bw &&
           y >= by && y <= by + bh
  }

  handleButton(id) {
    if (id === 'startGame') {
      this.state.gamePhase = 'playing'
      this.onStateChanged()
      return
    }

    if (id === 'nextLevel') {
      const next = Math.min(this.state.levelIndex + 1, LEVELS.length - 1)
      this.state.loadLevel(next)
      this.state.gamePhase = 'playing'
      this.onStateChanged()
      return
    }

    if (id === 'restart') {
      // 通关后点重启则重新开始第 1 关
      if (this.state.gamePhase === 'gameComplete') {
        this.state.loadLevel(0)
      } else {
        this.state.loadLevel(this.state.levelIndex)
      }
      this.onStateChanged()
      return
    }

    if (id === 'shareTool') {
      this.state.requestToolByShare('shuffle')
      this.onStateChanged()
      return
    }

    // 刷新
    if (id === 'tool_shuffle') {
      audioSystem.tool()
      if (this.state.tools.shuffle > 0) {
        this.state.tools.shuffle--
        this.onUseTool('shuffle')
      } else {
        this.state.requestToolByShare('shuffle')
      }
      this.onStateChanged()
      return
    }

    // 爆破
    if (id === 'tool_bomb') {
      audioSystem.tool()
      if (this.state.tools.bomb > 0) {
        this.currentTool = 'bomb'
      } else {
        this.state.requestToolByShare('bomb')
      }
      return
    }

    // 换位
    if (id === 'tool_swap') {
      audioSystem.tool()
      if (this.state.tools.swap > 0) {
        this.currentTool = 'swap'
      } else {
        this.state.requestToolByShare('swap')
      }
      return
    }
  }
}
