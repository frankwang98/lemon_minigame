// src/ui.js
import { GAME_CONFIG } from './config.js'

export class UIManager {
  constructor(canvas, ctx, gameState) {
    this.canvas = canvas
    this.ctx = ctx
    this.state = gameState
    this.buttons = []
  }

  layoutButtons() {
    this.buttons = []
    const margin = GAME_CONFIG.buttonMargin
    const h = GAME_CONFIG.buttonHeight
    const fullWidth = this.canvas.width - margin * 2

    // ⭐⭐⭐ ready 状态：显示“开始游戏”
    if (this.state.gamePhase === 'ready') {
      const w = fullWidth
      const x = margin
      const y = this.canvas.height - 140
      this.buttons.push({ id: 'startGame', x, y, w, h, text: '开始游戏' })
      return
    }

    // ⭐⭐⭐ playing 状态：显示道具
    if (this.state.gamePhase === 'playing') {
      const y = this.canvas.height - 80
      const count = 3
      const gap = margin
      const w = (fullWidth - gap * (count - 1)) / count
      let x = margin

      this.buttons.push({ id: 'tool_shuffle', x, y, w, h, icon: '🔄', text: `刷新(${this.state.tools.shuffle})` })
      x += w + gap
      this.buttons.push({ id: 'tool_bomb', x, y, w, h, icon: '💣', text: `爆破(${this.state.tools.bomb})` })
      x += w + gap
      this.buttons.push({ id: 'tool_swap', x, y, w, h, icon: '🔁', text: `换位(${this.state.tools.swap})` })
      return
    }

    // ⭐⭐⭐ levelClear
    if (this.state.gamePhase === 'levelClear') {
      const y = this.canvas.height - 120
      const count = 2
      const gap = margin
      const w = (fullWidth - gap) / 2
      let x = margin

      this.buttons.push({ id: 'nextLevel', x, y, w, h, text: '下一关' })
      x += w + gap
      this.buttons.push({ id: 'shareTool', x, y, w, h, text: '分享获得道具' })
      return
    }

    // ⭐⭐⭐ gameOver
    if (this.state.gamePhase === 'gameOver') {
      const y = this.canvas.height - 120
      const count = 2
      const gap = margin
      const w = (fullWidth - gap) / 2
      let x = margin

      this.buttons.push({ id: 'restart', x, y, w, h, text: '重试' })
      x += w + gap
      this.buttons.push({ id: 'shareTool', x, y, w, h, text: '分享获得道具' })
      return
    }
  }

  drawButtons() {
    const ctx = this.ctx
    this.layoutButtons()

    this.buttons.forEach(btn => {
      const r = btn.h / 2
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(btn.x + r, btn.y)
      ctx.lineTo(btn.x + btn.w - r, btn.y)
      ctx.quadraticCurveTo(btn.x + btn.w, btn.y, btn.x + btn.w, btn.y + r)
      ctx.lineTo(btn.x + btn.w, btn.y + btn.h - r)
      ctx.quadraticCurveTo(btn.x + btn.w, btn.y + btn.h, btn.x + btn.w - r, btn.y + btn.h)
      ctx.lineTo(btn.x + r, btn.y + btn.h)
      ctx.quadraticCurveTo(btn.x, btn.y + btn.h, btn.x, btn.y + btn.h - r)
      ctx.lineTo(btn.x, btn.y + r)
      ctx.quadraticCurveTo(btn.x, btn.y, btn.x + r, btn.y)

      const gradient = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.h)
      gradient.addColorStop(0, '#FFE066')
      gradient.addColorStop(1, '#FFD43B')
      ctx.fillStyle = gradient
      ctx.shadowColor = 'rgba(0,0,0,0.15)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetY = 2
      ctx.fill()
      ctx.restore()

      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (btn.icon) {
        ctx.font = '18px sans-serif'
        ctx.fillText(btn.icon, btn.x + btn.w / 2, btn.y + btn.h / 2 - 8)
        ctx.font = '12px sans-serif'
        ctx.fillText(btn.text, btn.x + btn.w / 2, btn.y + btn.h / 2 + 10)
      } else {
        ctx.font = '16px sans-serif'
        ctx.fillText(btn.text, btn.x + btn.w / 2, btn.y + btn.h / 2)
      }
    })
  }

  hitTestButton(x, y) {
    return this.buttons.find(
      b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h
    )
  }
}
