import Tile from './tile.js'

export default class Grid {
  constructor(size = 4) {
    this.size = size
    this.reset()
  }

  reset() {
    this.cells = []
    for (let i = 0; i < this.size; i++) {
      this.cells[i] = []
      for (let j = 0; j < this.size; j++) {
        this.cells[i][j] = null
      }
    }
    this.addRandomTile()
    this.addRandomTile()
  }

  addRandomTile() {
    const empty = []
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (!this.cells[i][j]) empty.push({ x: i, y: j })
      }
    }
    if (empty.length === 0) return

    const spot = empty[Math.floor(Math.random() * empty.length)]
    this.cells[spot.x][spot.y] = new Tile(Math.random() < 0.9 ? 2 : 4)
  }

  move(dir) {
    // dir: 'up' 'down' 'left' 'right'
    let moved = false

    const moveLine = line => {
      let arr = line.filter(v => v)
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i].value === arr[i + 1].value && !arr[i].merged && !arr[i + 1].merged) {
          arr[i].value *= 2
          arr[i].merged = true
          arr.splice(i + 1, 1)
          moved = true
        }
      }
      while (arr.length < this.size) arr.push(null)
      return arr
    }

    for (let i = 0; i < this.size; i++) {
      let line = []
      for (let j = 0; j < this.size; j++) {
        let cell = null
        if (dir === 'left') cell = this.cells[i][j]
        if (dir === 'right') cell = this.cells[i][this.size - 1 - j]
        if (dir === 'up') cell = this.cells[j][i]
        if (dir === 'down') cell = this.cells[this.size - 1 - j][i]
        line.push(cell)
      }

      line = moveLine(line)

      for (let j = 0; j < this.size; j++) {
        let cell = line[j]
        if (cell) cell.merged = false

        if (dir === 'left') this.cells[i][j] = cell
        if (dir === 'right') this.cells[i][this.size - 1 - j] = cell
        if (dir === 'up') this.cells[j][i] = cell
        if (dir === 'down') this.cells[this.size - 1 - j][i] = cell
      }
    }

    if (moved) this.addRandomTile()
    return moved
  }

  hasMoves() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const cell = this.cells[i][j]
        if (!cell) return true
        if (i < this.size - 1 && this.cells[i + 1][j] && this.cells[i + 1][j].value === cell.value) return true
        if (j < this.size - 1 && this.cells[i][j + 1] && this.cells[i][j + 1].value === cell.value) return true
      }
    }
    return false
  }
}
