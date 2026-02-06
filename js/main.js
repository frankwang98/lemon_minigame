// src/main.js
import { GameState } from './game-state.js'
import { Renderer } from './renderer.js'
import { UIManager } from './ui.js'
import { InputManager } from './input.js'

const { windowWidth, windowHeight, pixelRatio } = wx.getSystemInfoSync()

// 逻辑尺寸（用来算布局）
const logicalWidth = windowWidth
const logicalHeight = windowHeight

const canvas = wx.createCanvas()
const ctx = canvas.getContext('2d')

// 物理尺寸（真实像素，用来变清晰）
canvas.width = logicalWidth * pixelRatio
canvas.height = logicalHeight * pixelRatio

// 把坐标系缩放回“逻辑尺寸”
ctx.scale(pixelRatio, pixelRatio)

const gameState = new GameState()
const renderer = new Renderer(canvas, ctx, gameState, logicalWidth, logicalHeight)
const uiManager = new UIManager(canvas, ctx, gameState, logicalWidth, logicalHeight)

let lastTick = Date.now()

function renderFrame() {
  const now = Date.now()

  if (gameState.gamePhase === 'playing') {
    if (now - lastTick >= 1000) {
      gameState.timeLeft--
      lastTick = now
      if (gameState.timeLeft <= 0) {
        gameState.gamePhase = 'gameOver'
      }
    }
  }

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

function onStateChanged() {}

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

gameState.loadLevel(0)

new InputManager(canvas, renderer, uiManager, gameState, onStateChanged, onUseTool)

renderFrame()
