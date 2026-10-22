// src/main.js
import { GameState } from './game-state.js'
import { Renderer } from './renderer.js'
import { UIManager } from './ui.js'
import { InputManager } from './input.js'
import { AudioManager } from './audio.js'
import { AudioSystem } from './audio-system.js'

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
      gameState.timeLeft = Math.max(0, gameState.timeLeft - Math.floor((now - lastTick) / 1000))
      lastTick = now
      if (gameState.timeLeft <= 0) {
        gameState.gamePhase = 'gameOver'
      }
    }
  } else {
    // 非游戏进行中时，重置 tick 避免时间跳跃
    lastTick = now
  }

  if (gameState.animations.length) {
    gameState.animations = gameState.animations.filter(anim => {
      const t = now - anim.startTime
      return t < anim.duration
    })

    if (gameState.resolving && !gameState.animations.some(a => a.type === 'eliminate')) {
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
    if (!gameState.resolving) gameState.swapCells(a, b)
  }
}

gameState.loadLevel(0)

new InputManager(canvas, renderer, uiManager, gameState, onStateChanged, onUseTool)

renderFrame()

// audio
const audio = new AudioManager()
audio.init()

// audio system - 合成音效 + BGM
const audioSystem = new AudioSystem()
globalThis.audioSystem = audioSystem

// 点击静音按钮切换 BGM
audioSystem.playBGM()  // 默认开启

// audio 兼容接口
let musicOn = true
globalThis.audio = {
  toggleMusic() {
    audioSystem.toggleBGM()
    musicOn = !musicOn
    this.enabledMusic = musicOn
  },
  get enabledMusic() { return musicOn }
}