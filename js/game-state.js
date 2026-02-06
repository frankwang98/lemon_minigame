// src/game-state.js
import { GAME_CONFIG } from './config.js'

export class GameState {
  constructor() {
    this.cols = GAME_CONFIG.cols
    this.rows = GAME_CONFIG.rows
    this.score = 0
    this.selectedCell = null // {col, row}
    this.board = []
    this.initBoard()
  }

  randomLemon() {
    return Math.floor(Math.random() * GAME_CONFIG.lemonTypes)
  }

  initBoard() {
    this.board = []
    for (let r = 0; r < this.rows; r++) {
      const row = []
      for (let c = 0; c < this.cols; c++) {
        let type
        do {
          type = this.randomLemon()
          row[c] = type
        } while (this.causesImmediateMatch(c, r, row, this.board))
      }
      this.board.push(row)
    }
  }

  causesImmediateMatch(c, r, row, board) {
    const type = row[c]
    // 横向
    if (c >= 2 && row[c - 1] === type && row[c - 2] === type) return true
    // 纵向
    if (r >= 2 && board[r - 1] && board[r - 2]) {
      if (board[r - 1][c] === type && board[r - 2][c] === type) return true
    }
    return false
  }

  inBounds(col, row) {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows
  }

  swapCells(a, b) {
    const tmp = this.board[a.row][a.col]
    this.board[a.row][a.col] = this.board[b.row][b.col]
    this.board[b.row][b.col] = tmp
  }

  isAdjacent(a, b) {
    const dx = Math.abs(a.col - b.col)
    const dy = Math.abs(a.row - b.row)
    return (dx + dy === 1)
  }

  findMatches() {
    const matches = []
    // 横向
    for (let r = 0; r < this.rows; r++) {
      let count = 1
      for (let c = 1; c <= this.cols; c++) {
        const curr = c < this.cols ? this.board[r][c] : null
        const prev = this.board[r][c - 1]
        if (curr === prev && curr !== null) {
          count++
        } else {
          if (count >= 3 && prev !== null) {
            for (let k = 0; k < count; k++) {
              matches.push({ col: c - 1 - k, row: r })
            }
          }
          count = 1
        }
      }
    }
    // 纵向
    for (let c = 0; c < this.cols; c++) {
      let count = 1
      for (let r = 1; r <= this.rows; r++) {
        const curr = r < this.rows ? this.board[r][c] : null
        const prev = this.board[r - 1][c]
        if (curr === prev && curr !== null) {
          count++
        } else {
          if (count >= 3 && prev !== null) {
            for (let k = 0; k < count; k++) {
              matches.push({ col: c, row: r - 1 - k })
            }
          }
          count = 1
        }
      }
    }
    // 去重
    const key = p => `${p.col},${p.row}`
    const map = {}
    matches.forEach(m => { map[key(m)] = m })
    return Object.values(map)
  }

  removeMatches(matches) {
    if (!matches.length) return 0
    matches.forEach(({ col, row }) => {
      this.board[row][col] = null
    })
    const gained = matches.length * 10
    this.score += gained
    return gained
  }

  applyGravity() {
    for (let c = 0; c < this.cols; c++) {
      let writeRow = this.rows - 1
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.board[r][c] !== null) {
          this.board[writeRow][c] = this.board[r][c]
          if (writeRow !== r) this.board[r][c] = null
          writeRow--
        }
      }
      for (let r = writeRow; r >= 0; r--) {
        this.board[r][c] = this.randomLemon()
      }
    }
  }

  resolveBoard() {
    let totalRemoved = 0
    while (true) {
      const matches = this.findMatches()
      if (!matches.length) break
      totalRemoved += this.removeMatches(matches)
      this.applyGravity()
    }
    return totalRemoved
  }

  trySwapAndResolve(a, b) {
    if (!this.isAdjacent(a, b)) return false
    this.swapCells(a, b)
    const matches = this.findMatches()
    if (!matches.length) {
      // 不产生消除，换回去
      this.swapCells(a, b)
      return false
    }
    // 有消除，先处理一次，再连锁
    this.removeMatches(matches)
    this.applyGravity()
    this.resolveBoard()
    return true
  }
}
