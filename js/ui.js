// src/ui.js
import { GAME_CONFIG } from './config.js'

export class UIManager {
  constructor(canvas, ctx, gameState, logicalWidth, logicalHeight) {
    this.canvas = canvas
    this.ctx = ctx
    this.state = gameState
    this.width = logicalWidth
    this.height = logicalHeight
    this.buttons = []
  }

  drawSoundButton() {
    const ctx = this.ctx
    const x = this.width - 60
    const y = 100
    const w = 40
    const h = 40
    const r = 20
  
    // 背景
    ctx.save()
    ctx.beginPath()
    ctx.arc(x + r, y + r, r, 0, Math.PI * 2)
    ctx.fillStyle = '#FFCF4A'
    ctx.shadowColor = 'rgba(0,0,0,0.22)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetY = 3
    ctx.fill()
    ctx.restore()
  
    // 图标
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '22px sans-serif'
    ctx.fillStyle = '#3A2500'
  
    const icon = (globalThis.audio && globalThis.audio.enabledSfx) ? '🔊' : '🔇'
    ctx.fillText(icon, x + r, y + r)
  }
  

  layoutButtons() {
    this.buttons = []
    const margin = GAME_CONFIG.buttonMargin
    const h = GAME_CONFIG.buttonHeight
    const fullWidth = this.width - margin * 2
  
    if (this.state.gamePhase === 'ready') {
      const w = fullWidth
      const x = margin
      const y = this.height - 140
      this.buttons.push({ id: 'startGame', x, y, w, h, text: '开始游戏' })
      return
    }

    if (this.state.gamePhase === 'playing') {
      const y = this.height - 80
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

    if (this.state.gamePhase === 'levelClear') {
      const y = this.height - 120
      const w = (fullWidth - margin) / 2
      let x = margin

      this.buttons.push({ id: 'nextLevel', x, y, w, h, text: '下一关' })
      x += w + margin
      this.buttons.push({ id: 'shareTool', x, y, w, h, text: '分享获得道具' })
      return
    }

    if (this.state.gamePhase === 'gameOver') {
      const y = this.height - 120
      const w = (fullWidth - margin) / 2
      let x = margin

      this.buttons.push({ id: 'restart', x, y, w, h, text: '重试' })
      x += w + margin
      this.buttons.push({ id: 'shareTool', x, y, w, h, text: '分享获得道具' })
      return
    }
  }

  drawButtons() {
    const ctx = this.ctx
    this.layoutButtons()
    this.drawSoundButton()
  
    this.buttons.forEach(btn => {
      // ⭐ 道具按钮更大：高度 +8px，字体更大
      const isTool = btn.id.startsWith('tool_')
      const extraH = isTool ? 8 : 0
      const h = btn.h + extraH
      const y = btn.y - extraH / 2
      const r = h / 2
  
      // ⭐ 更饱和的柠檬橙背景 + 更强阴影
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(btn.x + r, y)
      ctx.lineTo(btn.x + btn.w - r, y)
      ctx.quadraticCurveTo(btn.x + btn.w, y, btn.x + btn.w, y + r)
      ctx.lineTo(btn.x + btn.w, y + h - r)
      ctx.quadraticCurveTo(btn.x + btn.w, y + h, btn.x + btn.w - r, y + h)
      ctx.lineTo(btn.x + r, y + h)
      ctx.quadraticCurveTo(btn.x, y + h, btn.x, y + h - r)
      ctx.lineTo(btn.x, y + r)
      ctx.quadraticCurveTo(btn.x, y, btn.x + r, y)
  
      const gradient = ctx.createLinearGradient(btn.x, y, btn.x, y + h)
      gradient.addColorStop(0, '#FFCF4A')
      gradient.addColorStop(1, '#FFB020')
      ctx.fillStyle = gradient
  
      ctx.shadowColor = 'rgba(0,0,0,0.22)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetY = 4
      ctx.fill()
      ctx.restore()
  
      // ⭐ 轻描边
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(255,255,255,0.65)'
      ctx.stroke()
  
      // ⭐ 字体更醒目：深棕色 + 更大字号
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#3A2500'
  
      if (btn.icon) {
        // ⭐ 道具图标更大
        ctx.font = isTool ? '22px sans-serif' : '18px sans-serif'
        ctx.fillText(btn.icon, btn.x + btn.w / 2, y + h / 2 - 10)
  
        ctx.font = isTool ? '14px sans-serif' : '12px sans-serif'
        ctx.fillText(btn.text, btn.x + btn.w / 2, y + h / 2 + 12)
      } else {
        ctx.font = '20px sans-serif'
        ctx.fillText(btn.text, btn.x + btn.w / 2, y + h / 2)
      }
    })
  }  

  hitTestButton(x, y) {
    return this.buttons.find(
      b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h
    )
  }
}
