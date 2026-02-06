// src/renderer.js
import { GAME_CONFIG } from './config.js'

export class Renderer {
  constructor(canvas, ctx, gameState) {
    this.canvas = canvas
    this.ctx = ctx
    this.state = gameState

    this.gridWidth = canvas.width - GAME_CONFIG.padding * 2
    this.gridHeight = this.gridWidth
    this.cellSize = this.gridWidth / GAME_CONFIG.cols
  }

  clear() {
    this.ctx.fillStyle = GAME_CONFIG.backgroundColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawHeader() {
    const ctx = this.ctx
    ctx.fillStyle = GAME_CONFIG.textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
  
    const centerX = this.canvas.width / 2
    const top = 80   // 原来是 24，现在整体下移
  
    ctx.font = '26px sans-serif'
    ctx.fillText(GAME_CONFIG.title, centerX, top)
  
    ctx.font = '16px sans-serif'
    ctx.fillText(`分数：${this.state.score}`, centerX, top + 36)
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
  

  drawLemons() {
    const ctx = this.ctx
    const x0 = GAME_CONFIG.padding
    const y0 = GAME_CONFIG.gridTopOffset

    for (let r = 0; r < this.state.rows; r++) {
      for (let c = 0; c < this.state.cols; c++) {
        const type = this.state.board[r][c]
        if (type === null || type === undefined) continue

        const cx = x0 + c * this.cellSize + this.cellSize / 2
        const cy = y0 + r * this.cellSize + this.cellSize / 2
        const radius = this.cellSize * 0.38

        ctx.beginPath()
        ctx.fillStyle = GAME_CONFIG.lemonColors[type]
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fill()

        // 高光
        ctx.beginPath()
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.arc(cx - radius / 3, cy - radius / 3, radius / 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
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

  drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#FFFDF5')
    gradient.addColorStop(1, '#FFF7D6')
  
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  

  render() {
    this.clear()
    this.drawHeader()
    this.drawGridBackground()
    this.drawLemons()
    this.drawSelection()
    this.drawBackground()
  }

  // 工具：坐标转格子
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
