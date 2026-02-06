// src/game-state.js
import { GAME_CONFIG } from './config.js'
import { LEVELS } from './levels.js'

export class GameState {
  constructor() {
    this.cols = GAME_CONFIG.cols
    this.rows = GAME_CONFIG.rows

    this.levelIndex = 0
    this.score = 0
    this.totalScore = 0
    this.movesLeft = 0
    this.timeLeft = 0

    this.target = null
    this.collected = [0, 0, 0, 0]

    this.board = []
    this.selectedCell = null
    this.animations = []

    this.gamePhase = 'ready' // ready / playing / levelClear / gameOver

    // 道具
    this.tools = {
      shuffle: GAME_CONFIG.initialTools,
      bomb: GAME_CONFIG.initialTools,
      swap: GAME_CONFIG.initialTools
    }
  }

  randomLemon() {
    return Math.floor(Math.random() * GAME_CONFIG.lemonTypes)
  }

  loadLevel(index) {
    this.levelIndex = index
    const level = LEVELS[index]

    this.score = 0
    this.movesLeft = level.moves
    this.timeLeft = level.time
    this.target = level.target
    this.collected = [0, 0, 0, 0]

    this.selectedCell = null
    this.initBoard()

    this.gamePhase = index === 0 ? 'ready' : 'playing'
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
    if (c >= 2 && row[c - 1] === type && row[c - 2] === type) return true
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
    return dx + dy === 1
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

    const key = p => `${p.col},${p.row}`
    const map = {}
    matches.forEach(m => { map[key(m)] = m })
    return Object.values(map)
  }

  removeMatches(matches) {
    if (!matches.length) return 0

    matches.forEach(({ col, row }) => {
      const type = this.board[row][col]
      if (this.target && this.target.collect && this.target.collect.type === type) {
        this.collected[type]++
      }
      this.board[row][col] = null
    })

    const gained = matches.length * 10
    this.score += gained
    this.totalScore += gained

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

  resolveBoardWithAnimation(now) {
    const matches = this.findMatches()
    if (!matches.length) return false

    this.animations.push({
      type: 'eliminate',
      startTime: now,
      duration: 200,
      cells: matches
    })

    
    return true
  }

  finalizeElimination() {
    const matches = this.findMatches()
    if (!matches.length) return

    if (matches.length >= 5) {
      audio.playCombo()   // ⭐ 连击音效
    } else {
      audio.playNormal()  // ⭐ 普通消除音效
    }

    this.removeMatches(matches)
    this.applyGravity()
  }

  trySwapAndResolve(a, b, now) {
    if (!this.isAdjacent(a, b)) return false

    this.swapCells(a, b)
    const matches = this.findMatches()

    if (!matches.length) {
      this.swapCells(a, b)
      return false
    }

    this.movesLeft--

    this.animations.push({
      type: 'swap',
      startTime: now,
      duration: 150,
      from: a,
      to: b
    })

    return true
  }

  checkLevelStatus() {
    if (this.timeLeft <= 0 || this.movesLeft <= 0) {
      this.gamePhase = 'gameOver'
      return
    }

    if (this.target.score && this.score >= this.target.score) {
      this.gamePhase = 'levelClear'
      return
    }

    if (this.target.collect) {
      const t = this.target.collect
      if (this.collected[t.type] >= t.count) {
        this.gamePhase = 'levelClear'
        return
      }
    }
  }

  useBombAt(cell, now) {
    const cells = []
    for (let r = cell.row - 1; r <= cell.row + 1; r++) {
      for (let c = cell.col - 1; c <= cell.col + 1; c++) {
        if (this.inBounds(c, r)) cells.push({ col: c, row: r })
      }
    }

    this.animations.push({
      type: 'eliminate',
      startTime: now,
      duration: 200,
      cells
    })  
  }

  shuffleBoard() {
    const flat = []
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        flat.push(this.board[r][c])
      }
    }

    for (let i = flat.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const t = flat[i]
      flat[i] = flat[j]
      flat[j] = t
    }

    let idx = 0
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.board[r][c] = flat[idx++]
      }
    }
  }

  // ⭐⭐⭐ 分享获得道具（B 真分享）
  requestToolByShare(tool) {
    wx.shareAppMessage({
      title: '柠檬大消除',
      imageUrl: 'assets/images/share.png',
      success: () => {
        this.tools[tool]++
      }
    })

    /* ⭐⭐⭐ A 假分享（注释保留）
    this.tools[tool]++
    */
  }
}
