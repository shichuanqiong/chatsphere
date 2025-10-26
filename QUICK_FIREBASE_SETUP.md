# Firebase 快速接入步骤

## 📝 **你需要做的**

### **1. 创建 Firebase 项目** (5分钟)

访问：https://console.firebase.google.com/

1. 点击 "添加项目"
2. 项目名称：`chatsphere`（或任意名称）
3. 启用 Analytics（可选）
4. 完成创建

### **2. 创建 Web 应用** (2分钟)

1. 点击 Web 图标 </>
2. 应用昵称：`ChatSphere`
3. 点击"注册应用"
4. **复制配置信息**

### **3. 启用服务** (5分钟)

#### **Authentication**
- 左侧 → Authentication → 开始使用
- 启用 "Email/Password"
- 启用 "Anonymous"

#### **Firestore**
- 左侧 → Firestore Database → 创建数据库
- 测试模式 → 选择区域 → 启用

### **4. 配置环境变量** (2分钟)

在项目根目录创建 `.env.local`：

```bash
VITE_FIREBASE_API_KEY=你的apiKey
VITE_FIREBASE_AUTH_DOMAIN=你的authDomain
VITE_FIREBASE_PROJECT_ID=你的projectId
VITE_FIREBASE_STORAGE_BUCKET=你的storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=你的messagingSenderId
VITE_FIREBASE_APP_ID=你的appId
```

## ✅ **完成以上步骤后告诉我**

我会帮你：
- 修改认证系统
- 修改数据存储系统
- 实现实时同步
- 测试跨设备功能

**预计时间：15-20分钟**
