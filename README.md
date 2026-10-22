# 🍋 Lemon MiniGames · 柠檬小游戏大厅

同一仓库保留 **微信原生小游戏** 与 **GitHub Pages H5 小游戏大厅**，两者可独立运行。

## 两个版本

| 版本 | 入口 | 内容 | 运行方式 |
| --- | --- | --- | --- |
| 微信原生小游戏 | `game.js` / `game.json` | 三消、塔防 | 微信开发者工具导入**仓库根目录** |
| H5 游戏大厅 | `index.html` | 柠檬大消除、塔防 3.0 地狱模式 | GitHub Pages / 本地 HTTP 静态服务器 |

H5 地址：https://frankwang98.github.io/lemon_minigame/

## 目录说明

- `index.html`、`app.js`：H5 大厅和大消除
- `tower-defense-3.html`：H5 塔防 3.0（15 波、双路线、建塔/升级/出售）
- `h5-theme.css`：H5 统一视觉样式
- `h5-music.js`：H5 两款游戏共用的轻量背景旋律
- `h5-swipe.js`：页面边缘右滑返回大厅（不接管游戏画布滑动）
- `js/`：微信小游戏模块，部分状态/配置代码同时供 H5 使用
- `game.js`、`game.json`、`project.config.json`：微信小游戏入口与配置
- `.github/workflows/static.yml`：Pages 静态发布工作流

## 操作与声音

H5 两款游戏均有音乐、音效开关；音频基于 Web Audio 合成，不依赖外部音乐文件。移动端需要先触摸/点击以允许声音播放，是否发声还受设备音量及浏览器策略影响。

在 H5 大厅点击卡片进入游戏；大消除点击「返回大厅」，塔防点击顶部「返回大厅」。也可从屏幕左侧边缘右滑返回（不影响棋盘内滑动）。

## 本地预览

```bash
python3 -m http.server 8000
```

浏览器访问 http://localhost:8000/ 。ES Module 不能直接以 `file://` 方式加载。

## GitHub Pages 部署

仓库根目录作为站点根目录。工作流使用 `actions/upload-pages-artifact` 发布 `path: '.'`，Pages Source 选择 **GitHub Actions**。推送到 `main` 后会自动尝试部署；若提交由自动化凭据创建，可能不会触发新的 push 工作流，可在 Actions 手动执行 `workflow_dispatch`。

不要把 `docs/` 作为额外站点根目录，也不要同时维护两套 H5 入口。微信小游戏的原生入口不受 Pages 部署影响。

## 验证清单

1. H5 首页两张游戏卡片均能进入对应游戏。
2. 大消除滑动交换、道具、关卡推进与返回大厅正常。
3. 塔防建塔、升级、出售、波次与返回大厅正常。
4. 两款游戏的音乐和音效开关各只有一组，触摸后试听实际播放。
5. 微信开发者工具能正常导入根目录并运行原生小游戏。

> H5 源码可静态检查；微信真机和手机浏览器的声音行为需要分别实测。
