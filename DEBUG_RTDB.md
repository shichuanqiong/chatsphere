# 排查步骤

## 1. 检查 Firebase Console 数据

打开：https://console.firebase.google.com/project/chatsphere-28c89/database/data

**查看是否存在以下节点：**

- `status/{你的uid}` - 如果不存在，说明没写入成功
- `connections/{你的uid}` - 如果不存在，说明没写入成功

## 2. 检查浏览器控制台

打开 http://localhost:3002/chatsphere/，按 F12 → Console

**应该看到：**
- `✅ Presence registered for {你的uid}`

**如果看到错误：**
- 复制完整错误信息给我

## 3. 手动清理僵尸数据

在 Firebase Console → Realtime Database → Data：

**删除以下节点（清空所有数据）：**
- 点击右上角三个点 "..."
- 选择 "Clear all data"
- 确认删除

然后重新刷新页面登录。

## 4. 可能的问题

### 问题 1：规则太严格
你的规则需要 `auth != null`，但注册用户应该能通过。
**检查**：控制台有没有 `PERMISSION_DENIED` 错误？

### 问题 2：僵尸号来自 Firestore
如果 "Online Users" 列表还在显示僵尸号，说明它还在读 Firestore 而不是 RTDB。

**请告诉我：**
1. 浏览器控制台有什么错误？
2. Firebase Console 的 RTDB 里能看到 `status/` 和 `connections/` 数据吗？
3. 打开第二个标签页登录，第一个标签页的在线数会变化吗？
