export default class Player {
    constructor(x, y) {
      this.x = x
      this.y = y
      this.size = 40
      this.speed = 300
    }
  
    moveLeft(dt) {
      this.x -= this.speed * dt
    }
  
    moveRight(dt) {
      this.x += this.speed * dt
    }
  
    draw(ctx) {
      ctx.fillStyle = '#4A90E2'
      ctx.beginPath()
      ctx.moveTo(this.x, this.y - this.size / 2)
      ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2)
      ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2)
      ctx.closePath()
      ctx.fill()
    }
  }
  