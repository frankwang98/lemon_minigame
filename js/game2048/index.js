import Grid from './grid.js'

export default class Game2048 {
  constructor(canvas, ctx, onEnd) {
    this.canvas = canvas
    this.ctx = ctx
    this.onEnd = onEnd

    this.gameHeight = canvas.height * 0.7
    this.uiHeight = canvas.height * 0.3

    this.gridSize = 4
    this.cellSize = Math.floor(canvas.width / this.gridSize)

    this.reset()
  }

  reset() {
    this.grid = new Grid(this.gridSize)
    this.state = 'playing'
  }

  onTouchStart(e) {
    const touch = e.touches[0]
    const x = touch.clientX
    const y = touch.clientY

    // UI 区域
    if (y > this.gameHeight) {
      const w = this.canvas.width
      const top = this.gameHeight

      // 上
      if (x > w * 0.4 && x < w * 0.6 && y < top + 80) {
        this.grid.move('up')
        return
      }

      // 下
      if (x > w * 0.4 && x < w * 0.6 && y > top + 140) {
        this.grid.move('down')
        return
      }

      // 左
      if (x < w * 0.4 && y > top + 80 && y < top + 140) {
        this.grid.move('left')
        return
      }

      // 右
      if (x > w * 0.6 && y > top + 80 && y < top + 140) {
        this.grid.move('right')
        return
      }

      // 重新开始
      if (x > w - 120 && y > top + this.uiHeight - 50) {
        this.reset()
        return
      }
    }
  }

  onTouchEnd() {}

  update() {
    if (this.state !== 'playing') return

    if (!this.grid.hasMoves()) {
      this.state = 'over'
    }
  }

  render() {
    const ctx = this.ctx
    const { width, height } = this.canvas

    ctx.fillStyle = '#FFF9D9'
    ctx.fillRect(0, 0, width, height)

    // 游戏区域背景
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, this.gameHeight)

    // 绘制网格
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const cell = this.grid.cells[i][j]
        const x = j * this.cellSize
        const y = i * this.cellSize

        ctx.fillStyle = '#EEE'
        ctx.fillRect(x + 4, y + 4, this.cellSize - 8, this.cellSize - 8)

        if (cell) {
          ctx.fillStyle = '#FFC94A'
          ctx.fillRect(x + 4, y + 4, this.cellSize - 8, this.cellSize - 8)

          ctx.fillStyle = '#333'
          ctx.font = '24px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(cell.value, x + this.cellSize / 2, y + this.cellSize / 2)
        }
      }
    }

    // UI 区域
    ctx.fillStyle = '#FFE066'
    ctx.fillRect(0, this.gameHeight, width, this.uiHeight)

    // 按钮
    this.drawButtons(ctx)

    if (this.state === 'over') {
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#fff'
      ctx.font = '28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Game Over', width / 2, height / 2)
    }
  }

  drawButtons(ctx) {
    const w = this.canvas.width
    const top = this.gameHeight

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '22px sans-serif'
    ctx.textAlign = 'center'

    // 上
    ctx.fillText('↑', w * 0.5, top + 60)

    // 下
    ctx.fillText('↓', w * 0.5, top + 160)

    // 左
    ctx.fillText('←', w * 0.3, top + 110)

    // 右
    ctx.fillText('→', w * 0.7, top + 110)

    // 重新开始
    ctx.fillText('重新开始', w - 70, top + this.uiHeight - 20)
  }
}
