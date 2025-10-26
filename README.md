<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ChatSphere - 真人聊天室

一个现代化的聊天室应用，支持真人用户聊天、AI聊天、群聊、私聊、通知系统和聊天历史等功能。

## 新功能特性

### 🎯 真人用户功能
- **用户注册/登录系统** - 支持邮箱注册和密码登录
- **用户资料管理** - 可编辑个人资料、头像、简介等
- **好友系统** - 添加好友、查看好友列表
- **私聊功能** - 真人用户之间的直接消息

### 📬 收件箱系统
- **通知中心** - 好友请求、消息通知、系统通知
- **私聊消息** - 查看所有私聊对话
- **未读消息计数** - 实时显示未读消息数量
- **消息预览** - 快速查看最新消息内容

### 💬 聊天历史
- **聊天记录管理** - 查看所有聊天历史
- **分类筛选** - 按房间、私聊、AI聊天分类
- **归档功能** - 归档不需要的聊天
- **搜索功能** - 快速找到特定对话

### 🤖 AI聊天增强
- **保留原有AI功能** - 7个不同性格的AI角色
- **群聊支持** - AI和真人用户混合聊天
- **智能回复** - 基于上下文的AI回复

### 🎨 UI/UX改进
- **现代化设计** - 保持原有美观的UI风格
- **响应式布局** - 支持桌面和移动设备
- **实时通知** - 未读消息和通知指示器
- **流畅动画** - 平滑的页面切换和交互

## 技术栈
- **前端**: React 19 + TypeScript + Vite
- **状态管理**: React Hooks + localStorage
- **AI集成**: Google Gemini API
- **样式**: Tailwind CSS
- **图标**: Heroicons

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Local GIF Library (500 items) — No runtime API calls

This project ships with scripts to **download and cache 5×100 GIFs from GIPHY**
into `public/gifs/` and build a local `public/gifs/index.json`. The UI will
read from this local index and support **local search** (no external API).

### Windows (recommended)
```bat
scripts\download_gifs_windows.bat YOUR_GIPHY_API_KEY
```
If you omit the key, the script will use a default provided in `scripts/fetch_gifs.mjs`.

### PowerShell
```powershell
./scripts/download_gifs_windows.ps1 -GIPHY_API_KEY "YOUR_KEY"
```

### Node script (all platforms)
```bash
npm i node-fetch@3 p-limit@5 --save-dev
GIPHY_API_KEY=YOUR_KEY node scripts/fetch_gifs.mjs
```

Categories and counts:
- reactions: 100
- entertainment: 100
- sports: 100
- stickers: 100
- artists: 100

The fetcher uses small/medium variants to keep size low and adds simple tags
for local search.


### Rebuild local GIF index (no network)
```
node scripts/rebuild_gif_index.mjs
```
