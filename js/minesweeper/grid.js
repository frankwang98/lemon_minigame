import Cell from './cell.js'

export default class Grid {
  constructor(rows = 10, cols = 10, mines = 12) {
    this.rows = rows
    this.cols = cols
    this.mines = mines
    this.reset()
  }

  reset() {
    this.cells = []
    for (let r = 0; r < this.rows; r++) {
      this.cells[r] = []
      for (let c = 0; c < this.cols; c++) {
        this.cells[r][c] = new Cell()
      }
    }

    this.placeMines()
    this.calculateNumbers()
  }

  placeMines() {
    let placed = 0
    while (placed < this.mines) {
      const r = Math.floor(Math.random() * this.rows)
      const c = Math.floor(Math.random() * this.cols)
      if (!this.cells[r][c].isMine) {
        this.cells[r][c].isMine = true
        placed++
      }
    }
  }

  calculateNumbers() {
    const dirs = [
      [-1,-1],[-1,0],[-1,1],
      [0,-1],        [0,1],
      [1,-1],[1,0],[1,1]
    ]

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.cells[r][c].isMine) continue

        let count = 0
        for (let [dr, dc] of dirs) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
            if (this.cells[nr][nc].isMine) count++
          }
        }
        this.cells[r][c].number = count
      }
    }
  }

  open(r, c) {
    const cell = this.cells[r][c]
    if (cell.isOpen || cell.isFlag) return

    cell.isOpen = true

    // 空白自动展开
    if (cell.number === 0 && !cell.isMine) {
      const dirs = [
        [-1,-1],[-1,0],[-1,1],
        [0,-1],        [0,1],
        [1,-1],[1,0],[1,1]
      ]
      for (let [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          if (!this.cells[nr][nc].isOpen) this.open(nr, nc)
        }
      }
    }
  }

  checkWin() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[r][c]
        if (!cell.isMine && !cell.isOpen) return false
      }
    }
    return true
  }
}
