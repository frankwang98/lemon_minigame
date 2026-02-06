import Player from './player.js'
import Obstacle from './obstacle.js'

export default class RunnerGame {
  constructor(canvas, ctx, onEnd) {
    this.canvas = canvas
    this.ctx = ctx
    this.onEnd = onEnd

    this.gameHeight = canvas.height * 0.7
    this.uiHeight = canvas.height * 0.3

    this.reset()
  }

  reset() {
    const groundY = this.gameHeight - 20

    this.player = new Player(80, groundY)
    this.obstacles = []

    this.speed = 250
    this.spawnTimer = 0
    this.spawnInterval = 1200

    this.state = 'playing'
    this.score = 0

    this.lastTime = Date.now()
  }

  onTouchStart(e) {
    const touch = e.touches[0]
    const x = touch.clientX
    const y = touch.clientY

    // UI 区域
    if (y > this.gameHeight) {
      const w = this.canvas.width
      const h = this.uiHeight
      const top = this.gameHeight

      // 跳跃按钮
      if (x < w * 0.5 && y > top + 40 && y < top + 140) {
        this.player.jump()
        return
      }

      // 重新开始
      if (x > w * 0.6 && y > top + 80) {
        this.reset()
        return
      }
    }
  }

  onTouchEnd() {}

  update() {
    if (this.state !== 'playing') return

    const now = Date.now()
    const dt = (now - this.lastTime) / 1000
    this.lastTime = now

    // 玩家更新
    this.player.update(dt)

    // 障碍物生成
    this.spawnTimer += dt * 1000
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0
      const groundY = this.gameHeight - 20
      this.obstacles.push(new Obstacle(this.canvas.width + 30, groundY))
    }

    // 障碍物移动
    this.obstacles.forEach(o => o.update(dt, this.speed))

    // 移除离开屏幕的障碍物
    this.obstacles = this.obstacles.filter(o => o.x > -50)

    // 碰撞检测
    for (let o of this.obstacles) {
      if (o.isCollide(this.player.x, this.player.y, this.player.size)) {
        this.state = 'over'
        return
      }
    }

    // 得分
    this.score += dt * 10
  }

  render() {
    const ctx = this.ctx
    const { width, height } = this.canvas

    ctx.fillStyle = '#FFF9D9'
    ctx.fillRect(0, 0, width, height)

    // 游戏区域背景
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, this.gameHeight)

    // 地面线
    ctx.fillStyle = '#FFD166'
    ctx.fillRect(0, this.gameHeight - 20, width, 4)

    // 绘制玩家
    this.player.draw(ctx)

    // 绘制障碍物
    this.obstacles.forEach(o => o.draw(ctx))

    // UI 区域
    ctx.fillStyle = '#FFE066'
    ctx.fillRect(0, this.gameHeight, width, this.uiHeight)

    // 分数
    ctx.fillStyle = '#333'
    ctx.font = '20px sans-serif'
    ctx.fillText(`分数：${Math.floor(this.score)}`, 20, this.gameHeight + 30)

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

    // 跳跃按钮
    ctx.fillText('跳跃', w * 0.25, top + 100)

    // 重新开始
    ctx.fillText('重新开始', w * 0.75, top + 100)
  }
}
