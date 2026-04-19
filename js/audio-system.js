// src audio-manager.js
export class AudioSystem {
    constructor() {
      this.ctx = wx.createWebAudioContext()
      this.enabled = true

      // 全局音量控制
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.9
      this.master.connect(this.ctx.destination)
    }

    toggle() {
      this.enabled = !this.enabled
    }

    // 带 Attack + Decay + 可选延迟
    playOsc({ type='sine', freq=440, duration=0.15, volume=0.3, freqEnd=null, delay=0 }) {
      if (!this.enabled) return

      const now = this.ctx.currentTime + delay
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

    // 果汁噪声（更清脆）
    playJuiceNoise(duration = 0.08, volume = 0.15, freq = 1000) {
      if (!this.enabled) return

      const now = this.ctx.currentTime
      const buffer = this.ctx.createBuffer(1, duration * this.ctx.sampleRate, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)

      // 白噪声 + 高通滤波效果
      for (let i = 0; i < data.length; i++) {
        const t = i / data.length
        // 包络：快速衰减
        const env = Math.exp(-t * 15)
        data[i] = (Math.random() * 2 - 1) * env * 0.5
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = freq

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(volume, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.master)

      noise.start(now)
      noise.stop(now + duration)
    }

    // 点击音 - 更清脆
    click() {
      // 高频短促音效
      this.playOsc({
        type: 'sine',
        freq: 800,
        duration: 0.05,
        volume: 0.2
      })
      // 加一点高频噪声
      this.playJuiceNoise(0.03, 0.08, 2000)
    }

    // 普通消除 - 清脆叮咚
    ding() {
      // 主音 - 上升音调
      const baseFreq = 880 + Math.random() * 200
      this.playOsc({
        type: 'sine',
        freq: baseFreq,
        duration: 0.1,
        volume: 0.3
      })
      // 泛音
      this.playOsc({
        type: 'triangle',
        freq: baseFreq * 2,
        duration: 0.08,
        volume: 0.15
      })
      // 清脆噪声
      this.playJuiceNoise(0.04, 0.1, 2500)
    }

    // 大消除 - 更饱满的爆炸声
    pop() {
      // 下降低音
      this.playOsc({
        type: 'triangle',
        freq: 300,
        freqEnd: 60,
        duration: 0.25,
        volume: 0.4
      })
      // 中频泛音
      this.playOsc({
        type: 'sine',
        freq: 600,
        freqEnd: 200,
        duration: 0.15,
        volume: 0.25
      })
      // 爆炸噪声
      this.playJuiceNoise(0.15, 0.25, 800)
      // 回声
      this.playOsc({
        type: 'sine',
        freq: 400,
        duration: 0.2,
        volume: 0.1,
        delay: 0.08
      })
    }

    // 掉落 - 更轻柔
    drop() {
      const base = 180 + Math.random() * 30
      this.playOsc({
        type: 'sine',
        freq: base,
        freqEnd: base * 0.5,
        duration: 0.08,
        volume: 0.18
      })
    }

    // 连击 - 递增音效
    combo(n) {
      const baseFreq = 440 + n * 100
      // 主音
      this.playOsc({
        type: 'sine',
        freq: baseFreq,
        duration: 0.12,
        volume: 0.3
      })
      // 泛音
      this.playOsc({
        type: 'triangle',
        freq: baseFreq * 1.5,
        duration: 0.1,
        volume: 0.15
      })
      this.playJuiceNoise(0.05, 0.1, 1500)
    }

    // 失败交换 - 短促提醒
    fail() {
      this.playOsc({
        type: 'square',
        freq: 200,
        freqEnd: 100,
        duration: 0.08,
        volume: 0.2
      })
    }

    // 工具使用 - 确认音效
    tool() {
      // 双音确认
      this.playOsc({
        type: 'sine',
        freq: 1000,
        duration: 0.06,
        volume: 0.25
      })
      this.playOsc({
        type: 'sine',
        freq: 1400,
        duration: 0.08,
        volume: 0.2,
        delay: 0.05
      })
    }

    // 挑战成功 - 更欢乐
    victory() {
      if (!this.enabled) return
      const now = this.ctx.currentTime

      // 上升音阶：叮 - 叮 - 叮
      const notes = [523, 659, 784, 1047]  // C5 E5 G5 C6
      notes.forEach((f, i) => {
        this.playOsc({
          type: 'sine',
          freq: f,
          duration: 0.2,
          volume: 0.3,
          delay: i * 0.12
        })
        // 泛音
        this.playOsc({
          type: 'triangle',
          freq: f * 2,
          duration: 0.15,
          volume: 0.12,
          delay: i * 0.12
        })
      })

      // 欢乐噪声
      this.playJuiceNoise(0.2, 0.2, 1200)
    }

    // 挑战失败 - 更遗憾
    gameOver() {
      if (!this.enabled) return
      const now = this.ctx.currentTime

      // 下降滑音
      this.playOsc({
        type: 'triangle',
        freq: 350,
        freqEnd: 80,
        duration: 0.4,
        volume: 0.35
      })

      // 轻微噪声
      this.playJuiceNoise(0.15, 0.08, 600)
    }
  }
  