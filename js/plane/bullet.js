export default class Bullet {
    constructor(x, y) {
      this.x = x
      this.y = y
      this.size = 6
      this.speed = 450
    }
  
    update(dt) {
      this.y -= this.speed * dt
    }
  
    draw(ctx) {
      ctx.fillStyle = '#FFD166'
      ctx.fillRect(this.x - this.size / 2, this.y - this.size, this.size, this.size)
    }
  }
  