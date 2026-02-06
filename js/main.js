// src/main.js
import { GameState } from './game-state.js'
import { Renderer } from './renderer.js'
import { UIManager } from './ui.js'
import { InputManager } from './input.js'

const { windowWidth, windowHeight } = wx.getSystemInfoSync()

const canvas = wx.createCanvas()
const ctx = canvas.getContext('2d')

canvas.width = windowWidth
canvas.height = windowHeight

const gameState = new GameState()
const renderer = new Renderer(canvas, ctx, gameState)
const uiManager = new UIManager(canvas, ctx, gameState)

let lastTick = Date.now()

function renderFrame() {
  const now = Date.now()

  // ⭐ 时间倒计时（仅 playing 状态）
  if (gameState.gamePhase === 'playing') {
    if (now - lastTick >= 1000) {
      gameState.timeLeft--
      lastTick = now
      if (gameState.timeLeft <= 0) {
        gameState.gamePhase = 'gameOver'
      }
    }
  }

  // ⭐ 动画处理
  if (gameState.animations.length) {
    gameState.animations = gameState.animations.filter(anim => {
      const t = now - anim.startTime
      return t < anim.duration
    })

    if (!gameState.animations.some(a => a.type === 'eliminate')) {
      gameState.finalizeElimination()
      gameState.checkLevelStatus()
    }
  }

  renderer.render(now)
  uiManager.drawButtons()

  requestAnimationFrame(renderFrame)
}

function onStateChanged() {
  // 渲染循环常驻，不需要额外操作
}

function onUseTool(tool, data) {
  const now = Date.now()

  if (tool === 'bomb') {
    gameState.useBombAt(data, now)
  }

  if (tool === 'shuffle') {
    gameState.shuffleBoard()
  }

  if (tool === 'swap') {
    const { a, b } = data
    gameState.swapCells(a, b)
    gameState.movesLeft--
  }
}

new InputManager(canvas, renderer, uiManager, gameState, onStateChanged, onUseTool)

// ⭐ 游戏启动时直接加载第一关
gameState.loadLevel(0)

renderFrame()
