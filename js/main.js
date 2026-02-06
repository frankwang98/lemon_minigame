// src/main.js
import { GAME_CONFIG } from './config.js'
import { GameState } from './game-state.js'
import { Renderer } from './renderer.js'
import { InputManager } from './input.js'

const { windowWidth, windowHeight } = wx.getSystemInfoSync()

const canvas = wx.createCanvas()
const ctx = canvas.getContext('2d')

canvas.width = windowWidth
canvas.height = windowHeight

const gameState = new GameState()
const renderer = new Renderer(canvas, ctx, gameState)

function render() {
  renderer.render()
}

new InputManager(canvas, renderer, gameState, render)

// 初次渲染
render()
