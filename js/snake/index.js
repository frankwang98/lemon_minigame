import Snake from './snake.js'
import Food from './food.js'

export default class SnakeGame {
  constructor(canvas, ctx, onEnd) {
    this.canvas = canvas
    this.ctx = ctx
    this.onEnd = onEnd

    this.gridSize = 20
    this.gameHeight = canvas.height * 0.7
    this.uiHeight = canvas.height * 0.3

    this.cellSize = Math.floor(canvas.width / this.gridSize)

    this.reset()
  }

  reset() {
    this.snake = new Snake(this.gridSize)
    this.food = new Food(this.gridSize)

    this.state = 'playing'
    this.score = 0

    this.lastTime = Date.now()
    this.moveInterval = 150
    this.accumulator = 0
  }

  // 按钮区域点击
  onTouchStart(e) {
    const touch = e.touches[0]
    const x = touch.clientX
    const y = touch.clientY

    // 如果点击在 UI 区域
    if (y > this.gameHeight) {
      this.handleButtonClick(x, y)
      return
    }

    // 游戏区域不处理触摸
  }

  onTouchEnd() {}

  handleButtonClick(x, y) {
    const w = this.canvas.width
    const h = this.uiHeight
    const top = this.gameHeight

    // 重新开始按钮
    if (y > top + h - 50 && x > w - 120) {
      this.reset()
      return
    }

    // 上
    if (x > w * 0.4 && x < w * 0.6 && y < top + 80) {
      this.snake.setDirection(0, -1)
      return
    }

    // 下
    if (x > w * 0.4 && x < w * 0.6 && y > top + 140) {
      this.snake.setDirection(0, 1)
      return
    }

    // 左
    if (x < w * 0.4 && y > top + 80 && y < top + 140) {
      this.snake.setDirection(-1, 0)
      return
    }

    // 右
    if (x > w * 0.6 && y > top + 80 && y < top + 140) {
      this.snake.setDirection(1, 0)
      return
    }
  }

  update() {
    if (this.state !== 'playing') return

    const now = Date.now()
    const dt = now - this.lastTime
    this.lastTime = now

    this.accumulator += dt
    if (this.accumulator < this.moveInterval) return
    this.accumulator = 0

    const newHead = this.snake.update()

    // 撞自己
    if (this.snake.hitsSelf()) {
      this.state = 'over'
      return
    }

    // 吃食物
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.food.randomize()
      this.score++
    } else {
      this.snake.shrink()
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

    // 绘制食物 & 蛇
    this.food.draw(ctx, this.cellSize, 0)
    this.snake.draw(ctx, this.cellSize, 0)

    // UI 区域背景
    ctx.fillStyle = '#FFE066'
    ctx.fillRect(0, this.gameHeight, width, this.uiHeight)

    // 分数
    ctx.fillStyle = '#333'
    ctx.font = '20px sans-serif'
    ctx.fillText(`      分数：${this.score}`, 20, this.gameHeight + 30)

    // 按钮区域
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

    ctx.fillStyle = '#111111'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'

    // 上
    ctx.fillText('↑', w / 2, top + 60)

    // 下
    ctx.fillText('↓', w / 2, top + 160)

    // 左
    ctx.fillText('←', w * 0.3, top + 110)

    // 右
    ctx.fillText('→', w * 0.7, top + 110)

    // 重新开始
    ctx.fillText('重新开始', w - 70, top + this.uiHeight - 20)
  }
}
