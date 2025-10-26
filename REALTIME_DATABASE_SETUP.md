# Firebase Realtime Database 设置步骤

## 在 Firebase Console 中设置

1. 访问 https://console.firebase.google.com/project/chatsphere-28c89
2. 点击左侧 "Realtime Database"
3. 点击 "Create database"
4. 选择位置（选择与 Firestore 相同的区域）
5. 选择 "Start in test mode"（生产环境需要调整规则）

## 数据库规则

创建后将 `rules.json` 内容替换为：

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "status": {
      "$uid": {
        ".read": true,
        ".write": "auth != null && $uid === auth.uid"
      }
    },
    "connections": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && $uid === auth.uid"
      }
    },
    "roomMembers": {
      "$roomId": {
        "$uid": {
          ".read": true,
          ".write": "auth != null && $uid === auth.uid"
        }
      }
    }
  }
}
```

## 文件准备

1. 我接下来会创建这些文件：
   - `services/presenceService.ts` - 处理在线状态
   - `services/roomPresenceService.ts` - 处理房间在线人数
   - 修改 `components/Sidebar.tsx` - 使用新服务

## 开始集成

准备好了吗？如果 Firebase Console 已经创建了 Realtime Database，我就开始写代码！
