export default class Player {
    constructor(x, groundY) {
      this.x = x
      this.y = groundY
      this.groundY = groundY
  
      this.vy = 0
      this.size = 30
      this.isJumping = false
    }
  
    jump() {
      if (!this.isJumping) {
        this.vy = -550
        this.isJumping = true
      }
    }
  
    update(dt) {
      this.y += this.vy * dt
      this.vy += 1500 * dt
  
      if (this.y >= this.groundY) {
        this.y = this.groundY
        this.vy = 0
        this.isJumping = false
      }
    }
  
    draw(ctx) {
      ctx.fillStyle = '#FFB703'
      ctx.fillRect(this.x - this.size / 2, this.y - this.size, this.size, this.size)
    }
  }
  