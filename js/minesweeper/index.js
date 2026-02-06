import Grid from './grid.js'

export default class MineSweeper {
  constructor(canvas, ctx, onEnd) {
    this.canvas = canvas
    this.ctx = ctx
    this.onEnd = onEnd

    this.gameHeight = canvas.height * 0.7
    this.uiHeight = canvas.height * 0.3

    this.rows = 10
    this.cols = 10
    this.cellSize = Math.floor(canvas.width / this.cols)

    this.flagMode = false

    this.reset()
  }

  reset() {
    this.grid = new Grid(this.rows, this.cols, 12)
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

      // 切换标记模式
      if (x < w * 0.5 && y > top + 40 && y < top + 140) {
        this.flagMode = !this.flagMode
        return
      }

      // 重新开始
      if (x > w * 0.6 && y > top + 80) {
        this.reset()
        return
      }

      return
    }

    // 游戏区域
    const r = Math.floor(y / this.cellSize)
    const c = Math.floor(x / this.cellSize)

    if (this.state !== 'playing') return

    const cell = this.grid.cells[r][c]

    if (this.flagMode) {
      cell.isFlag = !cell.isFlag
      return
    }

    if (cell.isMine) {
      this.state = 'over'
      return
    }

    this.grid.open(r, c)

    if (this.grid.checkWin()) {
      this.state = 'win'
    }
  }

  onTouchEnd() {}

  update() {}

  render() {
    const ctx = this.ctx
    const { width, height } = this.canvas

    ctx.fillStyle = '#FFF9D9'
    ctx.fillRect(0, 0, width, height)

    // 游戏区域背景
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, this.gameHeight)

    // 绘制格子
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid.cells[r][c]
        const x = c * this.cellSize
        const y = r * this.cellSize

        ctx.strokeStyle = '#DDD'
        ctx.strokeRect(x, y, this.cellSize, this.cellSize)

        if (cell.isOpen) {
          if (cell.isMine) {
            ctx.fillStyle = '#FF5252'
            ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4)
          } else {
            ctx.fillStyle = '#EEE'
            ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4)

            if (cell.number > 0) {
              ctx.fillStyle = '#333'
              ctx.font = '20px sans-serif'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText(cell.number, x + this.cellSize / 2, y + this.cellSize / 2)
            }
          }
        } else {
          ctx.fillStyle = '#FFE066'
          ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4)

          if (cell.isFlag) {
            ctx.fillStyle = '#FF5252'
            ctx.font = '20px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('⚑', x + this.cellSize / 2, y + this.cellSize / 2)
          }
        }
      }
    }

    // UI 区域
    ctx.fillStyle = '#FFE066'
    ctx.fillRect(0, this.gameHeight, width, this.uiHeight)

    ctx.fillStyle = '#333'
    ctx.font = '20px sans-serif'
    ctx.fillText(`标记模式：${this.flagMode ? '开' : '关'}`, 20, this.gameHeight + 30)

    // 按钮
    this.drawButtons(ctx)

    if (this.state === 'over') {
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#fff'
      ctx.font = '28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('踩雷了！', width / 2, height / 2)
    }

    if (this.state === 'win') {
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#fff'
      ctx.font = '28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('胜利！', width / 2, height / 2)
    }
  }

  drawButtons(ctx) {
    const w = this.canvas.width
    const top = this.gameHeight

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '22px sans-serif'
    ctx.textAlign = 'center'

    ctx.fillText('标记模式', w * 0.25, top + 100)
    ctx.fillText('重新开始', w * 0.75, top + 100)
  }
}
