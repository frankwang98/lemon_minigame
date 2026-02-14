// src/audio-manager.js
export class AudioSystem {
    constructor() {
      this.ctx = wx.createWebAudioContext()
      this.enabled = true
  
      // ⭐ 全局音量控制
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.9
      this.master.connect(this.ctx.destination)
    }
  
    toggle() {
      this.enabled = !this.enabled
    }
  
    // ⭐ 改进版：带 Attack + Decay
    playOsc({ type='sine', freq=440, duration=0.15, volume=0.3, freqEnd=null }) {
      if (!this.enabled) return
  
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
  
      osc.type = type
      osc.frequency.setValueAtTime(freq, now)
  
      if (freqEnd) {
        osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration)
      }
  
      // Attack + Decay
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  
      osc.connect(gain)
      gain.connect(this.master)
  
      osc.start(now)
      osc.stop(now + duration)
    }
  
    // ⭐ 果汁噪声
    playJuiceNoise(duration = 0.08, volume = 0.15) {
      if (!this.enabled) return
  
      const now = this.ctx.currentTime
      const buffer = this.ctx.createBuffer(1, duration * this.ctx.sampleRate, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
  
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5
      }
  
      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer
  
      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(volume, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  
      noise.connect(gain)
      gain.connect(this.master)
  
      noise.start(now)
      noise.stop(now + duration)
    }
  
    // 🍋 点击音
    click() {
      this.playOsc({
        freq: 700 + Math.random() * 80,
        duration: 0.07,
        volume: 0.25
      })
    }
  
    // 🍋 普通消除
    ding() {
      this.playOsc({
        freq: 1100 + Math.random() * 150,
        duration: 0.12,
        volume: 0.28
      })
      this.playJuiceNoise(0.06, 0.12)
    }
  
    // 🍋 大消除
    pop() {
      this.playOsc({
        type: 'triangle',
        freq: 260,
        freqEnd: 80,
        duration: 0.22,
        volume: 0.35
      })
      this.playJuiceNoise(0.12, 0.22)
    }
  
    // 🍋 掉落
    drop() {
      const base = 140 + Math.random() * 25
      this.playOsc({
        type: 'sine',
        freq: base,
        freqEnd: base * 0.6,
        duration: 0.10,
        volume: 0.22
      })
    }
  
    // 🍋 连击
    combo(n) {
      const freq = 500 + n * 140
      this.playOsc({
        type: 'sine',
        freq,
        duration: 0.15,
        volume: 0.3
      })
    }
  
    // 🍋 失败交换
    fail() {
      this.playOsc({
        type: 'square',
        freq: 220,
        freqEnd: 150,
        duration: 0.10,
        volume: 0.22
      })
    }
  
    // 🍋 工具使用
    tool() {
      this.playOsc({
        type: 'sine',
        freq: 1200,
        duration: 0.12,
        volume: 0.3
      })
    }
  
    // 🍋 ⭐ 挑战成功（胜利音效）
    victory() {
      if (!this.enabled) return
      const now = this.ctx.currentTime
  
      // 叮 → 叮 → 叮（上扬三连音）
      const notes = [900, 1200, 1500]
      notes.forEach((f, i) => {
        const t = now + i * 0.12
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
  
        osc.type = 'sine'
        osc.frequency.setValueAtTime(f, t)
  
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.exponentialRampToValueAtTime(0.35, t + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
  
        osc.connect(gain)
        gain.connect(this.master)
  
        osc.start(t)
        osc.stop(t + 0.18)
      })
  
      // 果汁飞溅
      this.playJuiceNoise(0.15, 0.25)
    }
  
    // 🍋 ⭐ 挑战失败（失败音效）
    gameOver() {
      if (!this.enabled) return
      const now = this.ctx.currentTime
  
      // 低沉下滑音
      this.playOsc({
        type: 'triangle',
        freq: 300,
        freqEnd: 120,
        duration: 0.35,
        volume: 0.35
      })
  
      // 轻微噪声（叹气感）
      this.playJuiceNoise(0.12, 0.10)
    }
  }
  