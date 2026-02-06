// src/renderer.js
import { GAME_CONFIG } from './config.js'
import { LEVELS } from './levels.js'

export class Renderer {
  constructor(canvas, ctx, gameState) {
    this.canvas = canvas
    this.ctx = ctx
    this.state = gameState

    this.gridWidth = canvas.width - GAME_CONFIG.padding * 2
    this.gridHeight = this.gridWidth
    this.cellSize = this.gridWidth / GAME_CONFIG.cols

    this.lemonImages = []
    this.imagesLoaded = false
    this.loadImages()
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
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    gradient.addColorStop(0, GAME_CONFIG.backgroundTop)
    gradient.addColorStop(1, GAME_CONFIG.backgroundBottom)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  // ⭐⭐⭐ 标题整体下移 + 更 Q 萌 + 更协调
  drawHeader() {
    const ctx = this.ctx
    const centerX = this.canvas.width / 2

    // 标题整体下移到 70px
    let y = 70

    ctx.fillStyle = GAME_CONFIG.textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    const level = LEVELS[this.state.levelIndex]

    // 主标题
    ctx.font = '26px sans-serif'
    ctx.fillText('🍋 ' + GAME_CONFIG.title + ' 🍋', centerX, y)
    y += 40

    // 关卡
    ctx.font = '17px sans-serif'
    ctx.fillText(`关卡 ${level.id} / ${LEVELS.length}`, centerX, y)
    y += 28

    // 目标
    let targetText = ''
    if (this.state.target && this.state.target.score) {
      targetText = `🎯 目标：得分 ${this.state.target.score}`
    } else if (this.state.target && this.state.target.collect) {
      const t = this.state.target.collect
      targetText = `🎯 目标：收集 ${t.count} 个元素 ${t.type + 1}`
    } else {
      targetText = '🎯 目标：自由消除'
    }
    ctx.fillText(targetText, centerX, y)
    y += 28

    // 分数 + 步数
    ctx.fillText(`🪙 ${this.state.score}     🌀 ${this.state.movesLeft}`, centerX, y)
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

        // 消除动画
        this.state.animations.forEach(anim => {
          const t = (now - anim.startTime) / anim.duration
          if (t < 0 || t > 1) return
          if (anim.type === 'eliminate') {
            if (anim.cells.some(p => p.col === c && p.row === r)) {
              scale = 1 - 0.7 * t
              alpha = 1 - t
            }
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

  drawPhaseOverlay() {
    const ctx = this.ctx
    if (this.state.gamePhase === 'levelClear' || this.state.gamePhase === 'gameOver') {
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '26px sans-serif'

      if (this.state.gamePhase === 'levelClear') {
        ctx.fillText('🎉 关卡完成！', this.canvas.width / 2, this.canvas.height / 2 - 20)
      } else {
        ctx.fillText('💔 挑战失败', this.canvas.width / 2, this.canvas.height / 2 - 20)
      }

      ctx.font = '16px sans-serif'
      ctx.fillText('使用下方按钮继续', this.canvas.width / 2, this.canvas.height / 2 + 12)
    }
  }

  drawMenu() {
    const ctx = this.ctx
    this.drawBackground()
    ctx.fillStyle = GAME_CONFIG.textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.font = '30px sans-serif'
    ctx.fillText('🍋 ' + GAME_CONFIG.title + ' 🍋', this.canvas.width / 2, this.canvas.height / 2 - 40)

    ctx.font = '16px sans-serif'
    ctx.fillText('轻触下方“开始游戏”按钮', this.canvas.width / 2, this.canvas.height / 2 + 4)
  }

  render(now) {
    this.drawBackground()
    if (this.state.gamePhase === 'menu') {
      this.drawMenu()
      return
    }
    this.drawHeader()
    this.drawGridBackground()
    this.drawLemons(now)
    this.drawSelection()
    this.drawPhaseOverlay()
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
