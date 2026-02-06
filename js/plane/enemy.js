export default class Enemy {
    constructor(x, y) {
      this.x = x
      this.y = y
      this.size = 36
      this.speed = 120
    }
  
    update(dt) {
      this.y += this.speed * dt
    }
  
    draw(ctx) {
      ctx.fillStyle = '#FF5252'
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size)
    }
  
    isHit(bullet) {
      return (
        Math.abs(this.x - bullet.x) < (this.size + bullet.size) / 2 &&
        Math.abs(this.y - bullet.y) < (this.size + bullet.size) / 2
      )
    }
  
    hitPlayer(player) {
      return (
        Math.abs(this.x - player.x) < (this.size + player.size) / 2 &&
        Math.abs(this.y - player.y) < (this.size + player.size) / 2
      )
    }
  }
  