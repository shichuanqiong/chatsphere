# Firebase Realtime Database 配置和用法

## 1. 规则配置

在 Firebase Console 中设置规则：

1. 打开 https://console.firebase.google.com/project/chatsphere-28c89/database
2. 选择 "Realtime Database" 标签
3. 点击 "Rules" 标签
4. 将下面的规则复制进去：

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "status": {
      "$uid": {
        ".read": true,
        ".write": true
      }
    },
    "connections": {
      "$uid": {
        ".read": true,
        ".write": true
      }
    },
    "roomMembers": {
      "$roomId": {
        "$uid": {
          ".read": true,
          ".write": true
        }
      }
    }
  }
}
```

⚠️ **注意**：上面是测试模式规则（所有读写开放）。生产环境应该修改为：

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "status": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid"
      }
    },
    "connections": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "roomMembers": {
      "$roomId": {
        "$uid": {
          ".read": true,
          ".write": "$uid === auth.uid"
        }
      }
    }
  }
}
```

然后点击 "Publish" 发布规则。

## 2. Presence 代码

### presenceService.ts（已创建）

```typescript
// 1. 监听在线状态变化
subscribeToOnlineStatus((onlineUsers) => {
  console.log('Online users:', onlineUsers);
});

// 2. 初始化用户在线状态
initUserPresence(user).then(cleanup => {
  // cleanup 函数用于清理
});

// 3. 退出登录时清理
cleanupUserPresence(user);
```

### 在 App.tsx 中使用

```typescript
import { initUserPresence, cleanupUserPresence } from './services/presenceService';

useEffect(() => {
  if (currentUser) {
    // 初始化 presence
    initUserPresence(currentUser).then(cleanup => {
      presenceCleanupRef.current = cleanup;
    });
  }
  
  return () => {
    if (presenceCleanupRef.current) {
      presenceCleanupRef.current();
    }
  };
}, [currentUser]);

const handleLogout = () => {
  if (currentUser) {
    cleanupUserPresence(currentUser);
  }
  logout();
  setCurrentUser(null);
};
```

## 3. 在 Sidebar 中使用

```typescript
import { subscribeToOnlineStatus } from '../services/presenceService';

const [realtimeOnlineCount, setRealtimeOnlineCount] = useState<number>(0);

useEffect(() => {
  const unsubscribe = subscribeToOnlineStatus((onlineUsers) => {
    setRealtimeOnlineCount(Object.keys(onlineUsers).length);
  });
  
  return () => unsubscribe();
}, []);
```

## 4. 测试步骤

1. **设置规则**：在 Firebase Console 中设置 RTDB 规则（见上面）
2. **刷新页面**：http://localhost:3002/chatsphere/
3. **查看控制台**：应该看到 `✅ Presence registered for {uid}`
4. **查看 Firebase Console → Realtime Database → Data**：
   - 应该能看到 `status/{uid}` 节点
   - 应该能看到 `connections/{uid}` 节点
5. **在线计数**：左上角应该显示正确的在线人数

## 5. 常见问题

### 问题 1: 显示 "0 Online"
- **原因**：RTDB 规则没有正确设置
- **解决**：按照步骤 1 设置规则

### 问题 2: 控制台报错 "PERMISSION_DENIED"
- **原因**：写入路径没有权限
- **解决**：检查 RTDB 规则是否允许当前用户写入

### 问题 3: 僵尸账号问题
- **原因**：之前的测试数据残留
- **解决**：在 Firebase Console 手动删除 `status/` 和 `connections/` 下的旧数据

## 6. 快速测试脚本

在浏览器控制台运行：

```javascript
import { ref, set, serverTimestamp } from 'firebase/database';
import { realtimeDB } from './services/firebase';

// 测试写入
set(ref(realtimeDB, `debug/ping/${Date.now()}`), { t: serverTimestamp() })
  .then(() => console.log("✅ RTDB write OK"))
  .catch(e => console.error("❌ RTDB write FAIL", e));
```

如果这个测试成功，说明 RTDB 连接正常。
