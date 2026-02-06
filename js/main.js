import EventHub from './event.js'
import { drawButton } from './common/ui.js'

import Minesweeper from './minesweeper/index.js'
import SnakeGame from './snake/index.js'
import RunnerGame from './runner/index.js'
import PlaneGame from './plane/index.js'
import Game2048 from './game2048/index.js'

export default class Main {
  constructor() {
    this.canvas = wx.createCanvas()
    this.ctx = this.canvas.getContext('2d')

    this.eventHub = new EventHub()
    this.currentGame = null

    this.buttons = []
    this.setupButtons()
    this.bindMenuEvents()

    this.loop = this.loop.bind(this)
    this.loop()
  }

  setupButtons() {
    const { width, height } = this.canvas
    const btnW = width * 0.6
    const btnH = 48
    const startY = height * 0.35
    const gap = 16

    const titles = ['扫雷', '贪吃蛇', '跑酷', '飞机大战', '2048']

    this.buttons = titles.map((t, i) => ({
      title: t,
      x: (width - btnW) / 2,
      y: startY + i * (btnH + gap),
      w: btnW,
      h: btnH
    }))
  }

  bindMenuEvents() {
    this.eventHub.handlers.touchstart = e => {
      const { clientX, clientY } = e.touches[0]
      for (let btn of this.buttons) {
        if (
          clientX >= btn.x &&
          clientX <= btn.x + btn.w &&
          clientY >= btn.y &&
          clientY <= btn.y + btn.h
        ) {
          this.startGame(btn.title)
          break
        }
      }
    }
  }

  startGame(title) {
    let game = null

    switch (title) {
      case '扫雷': game = new Minesweeper(this.canvas, this.ctx, () => this.backToMenu()); break
      case '贪吃蛇': game = new SnakeGame(this.canvas, this.ctx, () => this.backToMenu()); break
      case '跑酷': game = new RunnerGame(this.canvas, this.ctx, () => this.backToMenu()); break
      case '飞机大战': game = new PlaneGame(this.canvas, this.ctx, () => this.backToMenu()); break
      case '2048': game = new Game2048(this.canvas, this.ctx, () => this.backToMenu()); break
    }

    this.currentGame = game
    this.eventHub.bind(game)
  }

  backToMenu() {
    this.currentGame = null
    this.eventHub.unbind()
    this.bindMenuEvents()
  }

  loop() {
    this.update()
    this.render()
    requestAnimationFrame(this.loop)
  }

  update() {
    if (this.currentGame?.update) this.currentGame.update()
  }

  render() {
    const ctx = this.ctx
    const { width, height } = this.canvas

    ctx.fillStyle = '#FFF9D9'
    ctx.fillRect(0, 0, width, height)

    if (this.currentGame?.render) {
      this.currentGame.render()
      return
    }

    ctx.fillStyle = '#FFC94A'
    ctx.font = '32px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('柠檬小游戏盒', width / 2, height * 0.12)

    this.buttons.forEach(btn => {
      drawButton(ctx, btn.title, btn.x, btn.y, btn.w, btn.h)
    })
  }
}
