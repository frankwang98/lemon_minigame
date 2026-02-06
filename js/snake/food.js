export default class Food {
    constructor(gridSize) {
      this.gridSize = gridSize
      this.randomize()
    }
  
    randomize() {
      this.x = Math.floor(Math.random() * this.gridSize)
      this.y = Math.floor(Math.random() * this.gridSize)
    }
  
    draw(ctx, cellSize, offsetY) {
      ctx.fillStyle = '#FF5252'
      ctx.fillRect(
        this.x * cellSize,
        offsetY + this.y * cellSize,
        cellSize - 1,
        cellSize - 1
      )
    }
  }
  