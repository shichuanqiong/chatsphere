# GitHub Pages 部署测试计划

## 部署地址
https://shichuanqiong.github.io/chatsphere/

## 测试步骤

### 1. 等待部署完成
- GitHub Actions 会自动构建和部署
- 通常需要 2-5 分钟
- 访问上面的链接查看是否已部署

### 2. 测试跨设备同步功能

#### 设备 A（电脑）
1. 访问 https://shichuanqiong.github.io/chatsphere/
2. 登录（Guest 或注册账号）
3. 创建一个房间（例如 "GitHub测试房间1"）
4. 打开浏览器控制台（F12 → Console）
5. 查看是否有 "Room saved to Firestore" 日志

#### 设备 B（手机或另一台电脑）
1. 访问 https://shichuanqiong.github.io/chatsphere/
2. 登录（任意用户，Guest 或注册）
3. 等待 5-10 秒
4. 检查是否能看到 "GitHub测试房间1"

### 3. 测试数据持久化
1. 在设备 A 创建一个房间
2. 刷新页面（F5）
3. 检查房间是否还存在

### 4. 预期结果
- ✅ 房间能在不同设备间同步
- ✅ 刷新后房间不消失
- ✅ 控制台没有错误
- ✅ 在线用户数准确

## 如果出现问题
1. 检查控制台是否有错误
2. 确认 Firebase Console 中是否有 `rooms` collection
3. 截图发送给我

## Firebase Console 检查
https://console.firebase.google.com/project/chatsphere-28c89/firestore/data/~2Frooms
