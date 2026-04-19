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
    this.totalTimeUsed = 0  // 总闯关时间（秒）
    this.levelStartTime = 0  // 当前关开始时间
    this.levelTimeUsed = 0  // 本关用时（秒）- 关卡完成时锁定
    this.movesLeft = 0
    this.timeLeft = 0

    this.target = null
    this.collected = [0, 0, 0, 0]

    this.board = []
    this.selectedCell = null
    this.animations = []

    this.gamePhase = 'ready' // ready / playing / levelClear / gameOver / gameComplete

    // 道具
    this.tools = {
      shuffle: GAME_CONFIG.initialTools,
      bomb: GAME_CONFIG.initialTools,
      swap: GAME_CONFIG.initialTools
    }

    // ⭐ 拖动相关状态（给 renderer 用）
    this.draggingCell = null      // 当前被拖动的格子
    this.dragOffsetX = 0          // 拖动偏移 X
    this.dragOffsetY = 0          // 拖动偏移 Y
    this.dragDirection = null     // 'left' | 'right' | 'up' | 'down'
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
    this.levelStartTime = Date.now()  // 记录关卡开始时间
    this.levelTimeUsed = 0  // 重置用时

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

  getNeighbor(cell, dir) {
    const { row, col } = cell
    if (dir === 'left') return this.getCell(row, col - 1)
    if (dir === 'right') return this.getCell(row, col + 1)
    if (dir === 'up') return this.getCell(row - 1, col)
    if (dir === 'down') return this.getCell(row + 1, col)
    return null
  }

  getCell(row, col) {
    if (!this.inBounds(col, row)) return null
    return { row, col }
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
    let hasDropped = false
    for (let c = 0; c < this.cols; c++) {
      let writeRow = this.rows - 1
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.board[r][c] !== null) {
          if (writeRow !== r) {
            hasDropped = true
          }
          this.board[writeRow][c] = this.board[r][c]
          if (writeRow !== r) this.board[r][c] = null
          writeRow--
        }
      }
      for (let r = writeRow; r >= 0; r--) {
        this.board[r][c] = this.randomLemon()
      }
    }
    if (hasDropped) {
      audioSystem.drop()
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
      // audio.playCombo()   // ⭐ 连击音效
      audioSystem.pop()
    } else {
      // audio.playNormal()  // ⭐ 普通消除音效
      audioSystem.ding()
    }

    this.removeMatches(matches)
    this.applyGravity()
  }

  trySwapAndResolve(a, b, now) {
    // 非相邻 → 抖动提示
    if (!this.isAdjacent(a, b)) {
      this.animations.push({
        type: 'shake',
        startTime: now,
        duration: 150,
        cell: a
      })
      return false
    }

    this.swapCells(a, b)
    const matches = this.findMatches()

    if (!matches.length) {
      // 失败交换 → 回弹动画
      audioSystem.fail()
      this.movesLeft--
      this.swapCells(a, b) // 逻辑上立即换回
      this.animations.push({
        type: 'swapFail',
        startTime: now,
        duration: 150,
        from: a,
        to: b
      })
      return false
    }

    this.movesLeft--

    // 成功交换动画
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
      audioSystem.gameOver()
      this.gamePhase = 'gameOver'
      return
    }

    if (this.target.score && this.score >= this.target.score) {
      // 锁定用时
      this.levelTimeUsed = this.getLevelTimeUsed()
      const isLastLevel = this.levelIndex >= LEVELS.length - 1
      if (isLastLevel) {
        audioSystem.victory()
        this.gamePhase = 'gameComplete'
      } else {
        audioSystem.victory()
        this.gamePhase = 'levelClear'
      }
      return
    }

    if (this.target.collect) {
      const t = this.target.collect
      if (this.collected[t.type] >= t.count) {
        // 锁定用时
        this.levelTimeUsed = this.getLevelTimeUsed()
        const isLastLevel = this.levelIndex >= LEVELS.length - 1
        if (isLastLevel) {
          audioSystem.victory()
          this.gamePhase = 'gameComplete'
        } else {
          audioSystem.victory()
          this.gamePhase = 'levelClear'
        }
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

  requestToolByShare(tool) {
    wx.shareAppMessage({
      title: '柠檬大消除',
      imageUrl: 'assets/images/share.png',
      success: () => {
        this.tools[tool]++
      }
    })
  }

  // 获取本关用时（秒）
  getLevelTimeUsed() {
    // 如果已锁定用时，返回锁定值；否则实时计算
    if (this.levelTimeUsed > 0) return this.levelTimeUsed
    if (this.levelStartTime === 0) return 0
    return Math.floor((Date.now() - this.levelStartTime) / 1000)
  }
}
