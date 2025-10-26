# Firebase Firestore 数据库创建详细步骤

## 📍 访问 Firestore Database

直接点击这个链接：
https://console.firebase.google.com/project/chatsphere-28c89/firestore/databases

或者手动导航：
1. 打开 https://console.firebase.google.com/
2. 点击左侧菜单的 "Firestore Database"
3. 应该会看到 "Create database" 按钮

## 如果看不到 "Create database" 按钮

可能是因为：
1. **项目已创建了 Cloud SQL 或 Realtime Database**
   - 解决方法：直接使用现有的，或者创建一个新的数据库

2. **需要选择数据库类型**
   - 选择 "Native mode" (推荐，使用 Firestore)
   - 不要选择 "Datastore mode"

## 详细步骤

### 方法1：直接创建 Firestore
1. 访问上面的链接
2. 点击 "Create database" 按钮
3. 选择 "Start in test mode"
4. 选择位置（推荐选择和你最接近的，比如 us-central）
5. 点击 "Enable"

### 方法2：如果没有显示创建按钮
可能是你已经有一个数据库了，直接使用即可。

## 创建成功后
你会看到一个空白的数据库界面，这就是正常的。

## 📸 如果还是找不到，请截图给我看
把你看到的页面截图发给我，我帮你定位。
