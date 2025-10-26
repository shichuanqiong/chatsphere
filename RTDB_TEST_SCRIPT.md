# 测试 Firebase Realtime Database 写入

## 快速测试脚本

在浏览器控制台（F12 → Console）运行：

```javascript
// 导入 Firebase
import { ref, set, serverTimestamp } from 'firebase/database';
import { realtimeDB } from './services/firebase';

// 测试写入
const testRef = ref(realtimeDB, `debug/ping/${Date.now()}`);
set(testRef, { 
  timestamp: serverTimestamp(),
  message: 'Test ping from browser'
})
.then(() => console.log("✅ RTDB write OK - Firebase connection working!"))
.catch(e => console.error("❌ RTDB write FAIL", e));
```

## 手动测试步骤

### 1. 检查 Firebase 连接
打开浏览器控制台，应该看到：
- ✅ `✅ Presence registered for {你的uid}`

如果没有：
- ❌ `❌ Error setting user presence:` - 说明 RTDB 连接有问题

### 2. 检查 RTDB 数据
在 Firebase Console → Realtime Database → Data 查看：

**应该看到：**
```
status/
  ├─ {your-uid}/
  │   ├─ state: "online"
  │   └─ last_changed: {timestamp}

connections/
  ├─ {your-uid}/
  │   └─ {connId}: true
```

**如果看不到：**
1. 检查控制台是否有错误
2. 确认规则已正确发布
3. 确认用户已登录

### 3. 测试在线计数
打开页面后，左上角应该显示 "1 Online"（包含你自己）

打开第二个标签页：
1. 重新登录（可以是 Guest）
2. 观察第一个标签页的在线计数是否变为 "2"

## 如果还是显示 "0 Online"

可能原因：
1. **RTDB 规则太严格** - 当前的规则要求 `auth != null`，但 Guest 用户可能没有 Firebase Auth
2. **需要调整规则** - 允许 Guest 用户写入

请告诉我：
1. 控制台有什么错误？
2. Firebase Console → Realtime Database → Data 里能看到数据吗？
3. 你现在登录的是什么类型用户（Guest 还是注册用户）？
