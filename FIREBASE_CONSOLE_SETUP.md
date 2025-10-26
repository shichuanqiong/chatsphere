# Firebase 控制台配置说明

## 1. 启用 Authentication

1. 访问: https://console.firebase.google.com/project/chatsphere-28c89/authentication
2. 点击 "Get started"
3. 点击 "Sign-in method" 标签
4. 启用以下方式:
   - ✅ Email/Password - 点击 "Email/Password" → 启用 → Save
   - ✅ Anonymous - 点击 "Anonymous" → 启用 → Save

## 2. 创建 Firestore 数据库

1. 访问: https://console.firebase.google.com/project/chatsphere-28c89/firestore
2. 点击 "Create database"
3. 选择 "Start in test mode"（用于开发）
4. 选择区域（推荐选择离你最近的）
5. 点击 "Enable"

## 3. 设置 Firestore 规则（重要！）

1. 在 Firestore Database 页面
2. 点击 "Rules" 标签
3. 复制并粘贴以下规则:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允许所有已验证用户读取和写入房间
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // 允许读取和写入消息
    match /rooms/{roomId}/messages/{messageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // 用户数据
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. 点击 "Publish"

## 完成这些步骤后告诉我
