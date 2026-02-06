// src/audio.js

export class AudioManager {
    constructor() {
      // ⭐ 默认：音乐关、音效开
      this.enabledMusic = false
      this.enabledSfx = true
  
      this.bgm = null
      this.sfxNormal = null
      this.sfxCombo = null
    }
  
    init() {
      // ⭐ 背景音乐
      this.bgm = wx.createInnerAudioContext()
      this.bgm.src = 'audio/bgm.mp3'
      this.bgm.loop = true
      this.bgm.volume = 0.6
  
      // ⭐ 普通消除音效
      this.sfxNormal = wx.createInnerAudioContext()
      this.sfxNormal.src = 'audio/boom1.mp3'
      this.sfxNormal.volume = 1.0
  
      // ⭐ 连击音效
      this.sfxCombo = wx.createInnerAudioContext()
      this.sfxCombo.src = 'audio/boom2.mp3'
      this.sfxCombo.volume = 1.0
    }
  
    // -------------------------
    // 背景音乐控制
    // -------------------------
    playBGM() {
      if (!this.enabledMusic) return
      this.bgm.stop()
      this.bgm.play()
    }
  
    stopBGM() {
      this.bgm.stop()
    }
  
    toggleMusic() {
      this.enabledMusic = !this.enabledMusic
      if (this.enabledMusic) this.playBGM()
      else this.stopBGM()
    }
  
    // -------------------------
    // 音效控制（互斥播放）
    // -------------------------
    playNormal() {
      if (!this.enabledSfx) return
      this.sfxCombo.stop()
      this.sfxNormal.stop()
      this.sfxNormal.play()
    }
  
    playCombo() {
      if (!this.enabledSfx) return
      this.sfxNormal.stop()
      this.sfxCombo.stop()
      this.sfxCombo.play()
    }
  
    toggleSfx() {
      this.enabledSfx = !this.enabledSfx
    }
  }
  