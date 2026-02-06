export default class Obstacle {
    constructor(x, groundY) {
      this.x = x
      this.y = groundY
      this.size = 30
    }
  
    update(dt, speed) {
      this.x -= speed * dt
    }
  
    draw(ctx) {
      ctx.fillStyle = '#FF5252'
      ctx.fillRect(this.x - this.size / 2, this.y - this.size, this.size, this.size)
    }
  
    isCollide(px, py, psize) {
      return (
        Math.abs(this.x - px) < (this.size + psize) / 2 &&
        Math.abs(this.y - py) < (this.size + psize) / 2
      )
    }
  }
  