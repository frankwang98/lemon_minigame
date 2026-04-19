# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个微信小游戏项目——柠檬大消除（三消类游戏）。使用原生微信小游戏 API 开发，无需额外构建步骤。

## Key Commands

由于是微信小游戏，无本地 lint/test 命令。开发时使用微信开发者工具预览。

## Architecture

```
js/
├── main.js          # 入口，初始化游戏循环和事件监听
├── game-state.js   # 游戏状态管理（棋盘、匹配、消除、重力）
├── renderer.js     # Canvas 渲染（背景、柠檬、动画）
├── ui.js          # UI 管理（按钮绘制和点击检测）
├── input.js       # 输入管理（触摸事件、拖动交换）
├── audio-system.js # 音效系统（Web Audio API 合成音效）
├── config.js      # 游戏配置（格子大小、颜色、图片路径）
└── levels.js     # 关卡配置（10 关目标分数/步数/时间）
```

### Game Loop
- `main.js` 的 `renderFrame()` 通过 `requestAnimationFrame` 驱动游戏循环
- 每帧调用 `renderer.render(now)` 渲染画面
- 更新 `gameState.animations` 处理动画状态
- 游戏阶段：`ready` → `playing` → `levelClear` / `gameOver`

### Core Mechanics
- **三消逻辑**：`findMatches()` 横向/纵向检测 ≥3 相同
- **拖动交换**：`trySwapAndResolve()` 处理 swap/shake/swapFail 动画
- **重力下落**：`applyGravity()` 空位填充 + 新柠檬生成
- **道具**：bomb（3×3 爆破）、shuffle（随机打乱）、swap（指定交换）

## Important Notes

- `audio.js` 和 `audio-system.js` 是两个独立音频模块，功能不同
- 微信小游戏使用 `wx.onTouchStart/Move/End` 而非 DOM 事件
- Canvas 需处理 `pixelRatio` 适配高清屏
- 柠檬图片异步加载（`imagesLoaded` 标志）