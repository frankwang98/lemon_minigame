export default class Snake {
    constructor(gridSize) {
      this.gridSize = gridSize
      this.reset()
    }
  
    reset() {
      const mid = Math.floor(this.gridSize / 2)
      this.body = [
        { x: mid, y: mid },
        { x: mid - 1, y: mid },
        { x: mid - 2, y: mid }
      ]
  
      this.dir = { x: 1, y: 0 }
      this.nextDir = { x: 1, y: 0 }
    }
  
    setDirection(dx, dy) {
      if (dx === -this.dir.x && dy === -this.dir.y) return
      this.nextDir = { x: dx, y: dy }
    }
  
    update() {
      this.dir = this.nextDir
  
      const head = this.body[0]
      let newX = head.x + this.dir.x
      let newY = head.y + this.dir.y
  
      // 穿墙效果
      if (newX < 0) newX = this.gridSize - 1
      if (newX >= this.gridSize) newX = 0
      if (newY < 0) newY = this.gridSize - 1
      if (newY >= this.gridSize) newY = 0
  
      const newHead = { x: newX, y: newY }
      this.body.unshift(newHead)
      return newHead
    }
  
    shrink() {
      this.body.pop()
    }
  
    hitsSelf() {
      const head = this.body[0]
      return this.body.slice(1).some(p => p.x === head.x && p.y === head.y)
    }
  
    draw(ctx, cellSize, offsetY) {
      ctx.fillStyle = '#4CAF50'
      for (let p of this.body) {
        ctx.fillRect(
          p.x * cellSize,
          offsetY + p.y * cellSize,
          cellSize - 1,
          cellSize - 1
        )
      }
    }
  }
  