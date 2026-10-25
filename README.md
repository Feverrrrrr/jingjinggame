# 深海旅馆：13 楼没有客人

一个 2D 规则怪谈 / 夜班电梯游戏。

## 在线玩

**https://feverrrrrr.github.io/jingjinggame/**

仓库：https://github.com/Feverrrrrr/jingjinggame

> 这是 GitHub Pages 地址，不是仓库文件页。

## 操作

- 鼠标点击选项；
- 或按 `1 / 2 / 3`；
- `Enter` 继续；
- 右上角 `♪ BGM` 静音/恢复。

## 内容

- 5 个夜晚 × 5 次停靠；
- 4 个结局；
- 15 个 NPC 立绘；
- 两首无缝循环 BGM；
- 单局约 10~20 分钟。

## B站视频

**VIDEO_URL**

（发布后把 B站视频链接填在这里；也可以直接改这一行。）

## 本地运行

下载整个仓库后，双击 `index.html` 即可。  
不需要 Node、不需要服务器。

## 文件

| 文件 | 说明 |
|---|---|
| `index.html` | 游戏页面 |
| `core.js` | 无渲染游戏逻辑 |
| `game.js` | UI / BGM / 立绘 |
| `assets/` | BGM、NPC 立绘、13F 备用立绘 |
| `screenshot.png` | 游戏截图 |
| `LICENSE` | 代码 MIT；鲸鲸角色与系列名保留 |

## 部署到 GitHub Pages

仓库已带 `.github/workflows/pages.yml`。  
推送到 `main` 后，Actions 会自动构建并部署。

如果 Actions 没有自动启用 Pages：

1. 打开 `Settings → Pages`；
2. Source 选 `GitHub Actions`；
3. 再运行一次 `Deploy GitHub Pages` workflow。

如果页面 404：

- 确认 `index.html` 在仓库根目录，不在子文件夹；
- 确认 Pages 发布源是 `GitHub Actions` 或 `main / (root)`；
- 确认 `.nojekyll` 已上传；
- 等 Actions 的 `deploy` job 完成。

## 许可

代码 MIT；鲸鲸角色、系列名和角色图保留。  
游戏内 BGM 为本地程序化合成，NPC 立绘为本地生成并人工筛选。
