# Lemon MiniGames · H5

静态网页入口：`docs/index.html`。浏览器直接访问 GitHub Pages，无需后端、Node 或打包工具。

## 部署

1. 在 GitHub 仓库 Settings → Pages → Build and deployment 中选择 Deploy from a branch。
2. 选择 `main` 分支和 `/docs` 目录并保存。
3. 发布后访问 `https://frankwang98.github.io/lemon_minigame/`。

注意：仓库若为 Private，Pages 的可用性取决于账号方案；公开仓库一般可免费使用。

## 实现

- H5 游戏大厅：`docs/index.html`。
- 浏览器适配层：`docs/app.js`，使用 Pointer Events 兼容鼠标和触摸。
- 三消复用 `js/game-state.js`、`js/config.js`、`js/levels.js`。
- 塔防复用 `js/tower-defense.js`。
- 本地保存三消进度（localStorage），无需服务器。
- 微信小游戏入口 `game.js` 不受 H5 入口影响。

本版本尚需在真实浏览器和微信开发者工具中进行交互回归测试。
