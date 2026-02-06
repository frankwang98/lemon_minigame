import Player from './player.js'
import Bullet from './bullet.js'
import Enemy from './enemy.js'

export default class PlaneGame {
  constructor(canvas, ctx, onEnd) {
    this.canvas = canvas
    this.ctx = ctx
    this.onEnd = onEnd

    this.gameHeight = canvas.height * 0.7
    this.uiHeight = canvas.height * 0.3

    this.reset()
  }

  reset() {
    const { width } = this.canvas

    this.player = new Player(width / 2, this.gameHeight - 50)
    this.bullets = []
    this.enemies = []

    this.spawnTimer = 0
    this.spawnInterval = 1000

    this.shootTimer = 0
    this.shootInterval = 300

    this.state = 'playing'
    this.score = 0

    this.lastTime = Date.now()
  }

  onTouchStart(e) {
    const touch = e.touches[0]
    const x = touch.clientX
    const y = touch.clientY

    if (y > this.gameHeight) {
      const w = this.canvas.width
      const top = this.gameHeight

      // 左移动
      if (x < w * 0.33) {
        this.moveDir = -1
        return
      }

      // 右移动
      if (x > w * 0.66) {
        this.moveDir = 1
        return
      }

      // 中间 → 重新开始
      if (y > top + this.uiHeight - 60) {
        this.reset()
        return
      }
    }
  }

  onTouchEnd() {
    this.moveDir = 0
  }

  update() {
    if (this.state !== 'playing') return

    const now = Date.now()
    const dt = (now - this.lastTime) / 1000
    this.lastTime = now

    // 玩家移动
    if (this.moveDir === -1) this.player.moveLeft(dt)
    if (this.moveDir === 1) this.player.moveRight(dt)

    // 自动发射子弹
    this.shootTimer += dt * 1000
    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0
      this.bullets.push(new Bullet(this.player.x, this.player.y - 30))
    }

    // 子弹更新
    this.bullets.forEach(b => b.update(dt))
    this.bullets = this.bullets.filter(b => b.y > -20)

    // 敌机生成
    this.spawnTimer += dt * 1000
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0
      const x = Math.random() * this.canvas.width
      this.enemies.push(new Enemy(x, -30))
    }

    // 敌机更新
    this.enemies.forEach(e => e.update(dt))
    this.enemies = this.enemies.filter(e => e.y < this.gameHeight + 50)

    // 子弹击中敌机
    for (let e of this.enemies) {
      for (let b of this.bullets) {
        if (e.isHit(b)) {
          e.dead = true
          b.dead = true
          this.score += 10
        }
      }
    }

    this.enemies = this.enemies.filter(e => !e.dead)
    this.bullets = this.bullets.filter(b => !b.dead)

    // 敌机撞玩家
    for (let e of this.enemies) {
      if (e.hitPlayer(this.player)) {
        this.state = 'over'
        return
      }
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

    // 绘制玩家
    this.player.draw(ctx)

    // 绘制子弹
    this.bullets.forEach(b => b.draw(ctx))

    // 绘制敌机
    this.enemies.forEach(e => e.draw(ctx))

    // UI 区域
    ctx.fillStyle = '#FFE066'
    ctx.fillRect(0, this.gameHeight, width, this.uiHeight)

    // 分数
    ctx.fillStyle = '#333'
    ctx.font = '20px sans-serif'
    ctx.fillText(`分数：${this.score}`, 20, this.gameHeight + 30)

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

    ctx.fillText('← 左移', w * 0.2, top + 100)
    ctx.fillText('→ 右移', w * 0.8, top + 100)
    ctx.fillText('重新开始', w * 0.5, top + this.uiHeight - 20)
  }
}
