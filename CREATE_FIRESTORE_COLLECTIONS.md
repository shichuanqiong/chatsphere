# 创建 Firestore Collections 的步骤

## 问题说明
当前 Firestore 数据库已经创建，但是没有任何 Collections（数据表）。需要手动创建 `rooms` 和 `users` 两个 Collections。

## 创建 Collections 的步骤

### 1. 创建 `rooms` Collection
1. 在 Firestore Database 页面点击 **"+ Start collection"** 按钮
2. 在 "Collection ID" 输入框中输入：**`rooms`**
3. 点击 **"Next"**
4. 在 "Document ID" 输入框中输入任意值，例如：**`room-123`**
5. 在 "Field" 部分点击 **"Add field"**
   - Field name: `name`
   - Type: `string`
   - Value: `Test Room`
6. 点击 **"Save"**

### 2. 创建 `users` Collection
1. 再次点击页面顶部的 **"+ Start collection"** 按钮
2. 在 "Collection ID" 输入框中输入：**`users`**
3. 点击 **"Next"**
4. 在 "Document ID" 输入框中输入任意值，例如：**`user-123`**
5. 在 "Field" 部分点击 **"Add field"**
   - Field name: `nickname`
   - Type: `string`
   - Value: `Test User`
6. 点击 **"Save"**

## 验证
创建完成后，你应该在左侧边栏看到两个 Collections：
- `rooms` (1 document)
- `users` (1 document)

## 后续
创建完 Collections 后，应用程序会自动写入数据，你就不需要再手动创建文档了。

## 快捷方法（可选）
实际上，你不需要手动创建这些 Collections。应用程序会在第一次创建房间或用户时自动创建。但是，由于我们的代码可能有问题，所以最好先手动创建。
