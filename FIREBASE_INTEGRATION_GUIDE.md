# Firebase 接入指南

## 🚀 **快速开始**

### **步骤1：创建 Firebase 项目**

1. 访问 https://console.firebase.google.com/
2. 点击 "添加项目" 或 "创建项目"
3. 输入项目名称（例如：chatsphere）
4. 启用 Google Analytics（可选）
5. 点击 "创建项目"

### **步骤2：创建 Web 应用**

1. 在 Firebase 控制台中，点击 "Web 应用" 图标（</>）
2. 输入应用昵称（例如：ChatSphere）
3. 点击 "注册应用"
4. **复制配置信息**，你会看到类似这样的代码：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### **步骤3：启用 Firebase 服务**

#### **A. Authentication（用户身份验证）**

1. 在 Firebase 控制台中，点击左侧 "Authentication"
2. 点击 "开始使用"
3. 启用 "Email/Password" 和 "Anonymous" 登录方法
   - Email/Password: 用于注册用户
   - Anonymous: 用于 Guest 用户

#### **B. Firestore Database（存储数据库）**

1. 在 Firebase 控制台中，点击左侧 "Firestore Database"
2. 点击 "创建数据库"
3. 选择 "以测试模式启动"（开发时）
4. 选择区域（推荐选择离你最近的）
5. 点击 "启用"

#### **C. Realtime Database（实时同步，可选）**

1. 在 Firebase 控制台中，点击左侧 "Realtime Database"
2. 点击 "创建数据库"
3. 选择位置
4. 点击 "启用"

### **步骤4：配置环境变量**

1. 在项目根目录创建 `.env.local` 文件
2. 添加以下内容，替换为你的 Firebase 配置：

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Gemini API Key (keep your existing key)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### **步骤5：设置 Firestore 规则**

在 Firebase 控制台 → Firestore Database → 规则，添加：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允许所有用户读取房间数据
    match /rooms/{roomId} {
      allow read: if request.auth != null || request.auth == null;
      allow write: if request.auth != null;
    }
    
    // 允许所有用户读取/写入消息
    match /rooms/{roomId}/messages/{messageId} {
      allow read: if request.auth != null || request.auth == null;
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

### **步骤6：设置 Authentication 规则**

在 Firebase 控制台 → Authentication → 设置 → 授权域，确保你的域名（包括 `localhost`）已添加。

## 📋 **Firebase 功能说明**

### **1. Firestore Database**
- 存储用户数据、房间信息、消息记录
- 实时同步
- 跨设备可见

### **2. Authentication**
- 用户登录/注册
- Guest 匿名登录
- 身份验证

### **3. Realtime Database**
- 在线用户实时同步
- 实时监听在线状态变化
- 跨设备实时更新

## 🎯 **接入后可以实现的功能**

- ✅ 跨设备数据同步
- ✅ 跨设备实时在线用户
- ✅ 跨设备房间可见
- ✅ 跨设备消息同步
- ✅ 实时聊天体验
- ✅ 用户数据持久化

## ⚠️ **注意事项**

### **开发阶段**
- 使用测试模式规则，允许所有读写操作
- 开发完成后，更新为生产环境安全规则

### **生产环境**
- 设置严格的安全规则
- 启用身份验证要求
- 添加数据验证

### **成本**
- Firebase 免费配额（Spark 计划）：
  - Firestore: 1GB 存储，50K 读取/天，20K 写入/天
  - Authentication: 无限制
  - Realtime Database: 1GB 存储，100 并发连接
- 超出配额后需要升级到 Blaze 计划

## 🚀 **下一步**

配置完成后告诉我，我可以帮你：
1. 修改 `authService.ts` 使用 Firebase Authentication
2. 修改 `roomService.ts` 使用 Firestore
3. 添加实时在线用户同步
4. 测试跨设备功能

准备好了吗？提供你的 Firebase 配置信息，我来帮你接入！
