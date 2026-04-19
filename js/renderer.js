// src/renderer.js
import { GAME_CONFIG } from './config.js'
import { LEVELS } from './levels.js'

export class Renderer {
  constructor(canvas, ctx, gameState, logicalWidth, logicalHeight) {
    this.canvas = canvas
    this.ctx = ctx
    this.state = gameState

    this.width = logicalWidth
    this.height = logicalHeight

    this.gridWidth = this.width - GAME_CONFIG.padding * 2
    this.gridHeight = this.gridWidth
    this.cellSize = this.gridWidth / GAME_CONFIG.cols

    this.lemonImages = []
    this.imagesLoaded = false
    this.loadImages()

    this.motivationTexts = [
      "今天也要元气满满地消除呀！🍋",
      "慢慢来，柠檬也会变甜的。✨",
      "再坚持一下，你比自己想象得更厉害！💪",
      "每一步都算数，继续冲！🔥",
      "小小一步，也能带来大大的改变。🌟",
      "别急，节奏对了就能赢！🎯",
      "你已经很棒了，再来一点点！🍀",
      "保持专注，奇迹就在下一步！⚡",
      "放轻松，享受消除的快乐！😄",
      "加油，下一关等你来征服！🚀"
    ]

    this.currentMotivationIndex = 0
    this.lastMotivationSwitch = Date.now()
  }

  loadImages() {
    let loaded = 0
    GAME_CONFIG.lemonImagePaths.forEach((path, index) => {
      const img = wx.createImage()
      img.onload = () => {
        loaded++
        if (loaded === GAME_CONFIG.lemonImagePaths.length) {
          this.imagesLoaded = true
        }
      }
      img.src = path
      this.lemonImages[index] = img
    })
  }

  drawBackground() {
    const ctx = this.ctx
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height)
    gradient.addColorStop(0, GAME_CONFIG.backgroundTop)
    gradient.addColorStop(1, GAME_CONFIG.backgroundBottom)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, this.width, this.height)
  }

  drawHeader() {
    const ctx = this.ctx
    const centerX = this.width / 2
    let y = 70

    ctx.fillStyle = GAME_CONFIG.textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#2A1E00'

    const level = LEVELS[this.state.levelIndex]

    ctx.font = 'bold 26px sans-serif'
    ctx.fillText('🍋 ' + GAME_CONFIG.title + ' 🍋', centerX, y)
    y += 45

    ctx.font = '20px sans-serif'
    ctx.fillText(`🕒 时间：${this.state.timeLeft}s     🌀 步数：${this.state.movesLeft}`, centerX, y)
    y += 28

    ctx.fillText(`🎯 目标：${this.state.target.score} 分`, centerX, y)
    y += 38

    ctx.font = '25px sans-serif'
    ctx.fillText(`当前得分：${this.state.score}`, centerX, y)
  }

  drawLevelInfo() {
    const ctx = this.ctx
    const centerX = this.width / 2
    const y = GAME_CONFIG.gridTopOffset + this.gridHeight + 20

    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillStyle = '#3A2500'
    ctx.fillText(`第 ${this.state.levelIndex + 1} 关`, centerX, y)
  }

  drawMotivation(now) {
    if (now - this.lastMotivationSwitch > 5000) {
      this.currentMotivationIndex =
        (this.currentMotivationIndex + 1) % this.motivationTexts.length
      this.lastMotivationSwitch = now
    }

    const text = this.motivationTexts[this.currentMotivationIndex]

    const ctx = this.ctx
    const centerX = this.width / 2
    const y = GAME_CONFIG.gridTopOffset + this.gridHeight + 60

    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.font = '18px sans-serif'
    ctx.fillStyle = '#5A3A00'
    ctx.fillText(text, centerX, y)
  }

  drawGridBackground() {
    const ctx = this.ctx
    const x = GAME_CONFIG.padding
    const y = GAME_CONFIG.gridTopOffset
    const w = this.gridWidth
    const h = this.gridHeight
    const r = 20

    ctx.fillStyle = GAME_CONFIG.gridBgColor
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.fill()
  }

  // 简单缓动函数
  easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t)
  }

  drawLemons(now) {
    if (!this.imagesLoaded) return
    const ctx = this.ctx
    const x0 = GAME_CONFIG.padding
    const y0 = GAME_CONFIG.gridTopOffset

    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.12)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetY = 3

    for (let r = 0; r < this.state.rows; r++) {
      for (let c = 0; c < this.state.cols; c++) {
        const type = this.state.board[r][c]
        if (type === null || type === undefined) continue

        let cx = x0 + c * this.cellSize + this.cellSize / 2
        let cy = y0 + r * this.cellSize + this.cellSize / 2
        let scale = 1
        let alpha = 1

        // 拖动跟随
        if (this.state.draggingCell &&
            this.state.draggingCell.col === c &&
            this.state.draggingCell.row === r) {
          cx += this.state.dragOffsetX
          cy += this.state.dragOffsetY
        }

        // 动画处理
        this.state.animations.forEach(anim => {
          const t = (now - anim.startTime) / anim.duration
          if (t < 0 || t > 1) return

          const tt = this.easeOutQuad(t)

          if (anim.type === 'eliminate') {
            if (anim.cells.some(p => p.col === c && p.row === r)) {
              scale = 1 - 0.7 * t
              alpha = 1 - t
            }
          }

          if (anim.type === 'swap') {
            if (anim.from.col === c && anim.from.row === r) {
              cx += (anim.to.col - anim.from.col) * this.cellSize * tt
              cy += (anim.to.row - anim.from.row) * this.cellSize * tt
            }
            if (anim.to.col === c && anim.to.row === r) {
              cx += (anim.from.col - anim.to.col) * this.cellSize * tt
              cy += (anim.from.row - anim.to.row) * this.cellSize * tt
            }
          }

          if (anim.type === 'swapFail') {
            if (anim.from.col === c && anim.from.row === r) {
              const dirX = (anim.to.col - anim.from.col) * this.cellSize
              const dirY = (anim.to.row - anim.from.row) * this.cellSize
              const offset = (tt < 0.5 ? tt : 1 - tt) * 2 // 去再回
              cx += dirX * offset
              cy += dirY * offset
            }
            if (anim.to.col === c && anim.to.row === r) {
              const dirX = (anim.from.col - anim.to.col) * this.cellSize
              const dirY = (anim.from.row - anim.to.row) * this.cellSize
              const offset = (tt < 0.5 ? tt : 1 - tt) * 2
              cx += dirX * offset
              cy += dirY * offset
            }
          }

          if (anim.type === 'shake' &&
              anim.cell.col === c &&
              anim.cell.row === r) {
            const shake = Math.sin(t * Math.PI * 4) * 5
            cx += shake
          }
        })

        const size = this.cellSize * 0.8 * scale
        const x = cx - size / 2
        const y = cy - size / 2

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.drawImage(this.lemonImages[type], x, y, size, size)
        ctx.restore()
      }
    }

    ctx.restore()
  }

  drawSelection() {
    if (!this.state.selectedCell) return
    const { col, row } = this.state.selectedCell
    const x0 = GAME_CONFIG.padding
    const y0 = GAME_CONFIG.gridTopOffset
    const x = x0 + col * this.cellSize
    const y = y0 + row * this.cellSize

    const ctx = this.ctx
    ctx.strokeStyle = '#FFCA28'
    ctx.lineWidth = 3
    ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4)
  }

  drawDragArrow() {
    if (!this.state.draggingCell || !this.state.dragDirection) return

    const ctx = this.ctx
    const { col, row } = this.state.draggingCell
    const x = GAME_CONFIG.padding + col * this.cellSize + this.cellSize / 2
    const y = GAME_CONFIG.gridTopOffset + row * this.cellSize + this.cellSize / 2

    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '26px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'

    const map = {
      left: '⬅️',
      right: '➡️',
      up: '⬆️',
      down: '⬇️'
    }

    const icon = map[this.state.dragDirection]
    if (icon) ctx.fillText(icon, x, y)
    ctx.restore()
  }

  drawPhaseOverlay() {
    const ctx = this.ctx
    const phase = this.state.gamePhase
    if (phase === 'levelClear' || phase === 'gameOver' || phase === 'gameComplete') {
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(0, 0, this.width, this.height)

      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '26px sans-serif'

      if (phase === 'levelClear') {
        const timeUsed = this.state.getLevelTimeUsed()
        ctx.fillText('🎉 关卡完成！', this.width / 2, this.height / 2 - 50)
        ctx.font = '18px sans-serif'
        ctx.fillText(`用时：${timeUsed} 秒`, this.width / 2, this.height / 2 - 10)
        ctx.font = '14px sans-serif'
        ctx.fillText('点击下方按钮继续', this.width / 2, this.height / 2 + 18)
      } else if (phase === 'gameComplete') {
        // 通关显示
        const timeUsed = this.state.getLevelTimeUsed()
        ctx.fillText('🎉 恭喜通关！', this.width / 2, this.height / 2 - 50)
        ctx.font = '18px sans-serif'
        ctx.fillText(`总用时：${timeUsed} 秒`, this.width / 2, this.height / 2 - 10)
        ctx.font = '14px sans-serif'
        ctx.fillStyle = '#FFEE99'
        ctx.fillText('去 做更重要的事吧 💪', this.width / 2, this.height / 2 + 25)
      } else {
        ctx.fillText('💔 挑战失败', this.width / 2, this.height / 2 - 20)
        ctx.font = '16px sans-serif'
        ctx.fillText('使用下方按钮继续', this.width / 2, this.height / 2 + 12)
      }
    }
  }

  drawStartOverlay() {
    if (this.state.gamePhase !== 'ready') return

    const ctx = this.ctx
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.fillRect(0, 0, this.width, this.height)

    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '24px sans-serif'
    ctx.fillText('点击下方按钮开始游戏', this.width / 2, this.height / 2)
  }

  render(now) {
    this.drawBackground()
    this.drawHeader()
    this.drawGridBackground()
    this.drawLemons(now)
    this.drawSelection()
    this.drawLevelInfo()
    this.drawMotivation(now)
    this.drawDragArrow()
    this.drawPhaseOverlay()
    this.drawStartOverlay()
  }

  pointToCell(x, y) {
    const x0 = GAME_CONFIG.padding
    const y0 = GAME_CONFIG.gridTopOffset
    if (x < x0 || x > x0 + this.gridWidth) return null
    if (y < y0 || y > y0 + this.gridHeight) return null
    const col = Math.floor((x - x0) / this.cellSize)
    const row = Math.floor((y - y0) / this.cellSize)
    if (!this.state.inBounds(col, row)) return null
    return { col, row }
  }
}
