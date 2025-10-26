# ChatSphere 智能内容审核系统

## 🎯 系统概述

ChatSphere现在配备了完整的智能内容审核系统，包括实时bot监听、自动违规检测、智能警告和自动封禁功能。

## 🔍 Flagged Messages 系统说明

### **当前实现方式**
- **智能Bot监听**: 系统内置智能bot实时监听所有消息
- **自动检测**: 基于规则引擎的自动违规内容检测
- **实时处理**: 消息发送时立即检测和处理
- **无需用户举报**: 完全自动化的内容审核流程

### **检测机制**
1. **实时监听**: 每条消息发送时都会经过bot检测
2. **多维度分析**: 检测spam、hate speech、harassment、inappropriate、advertising、scam等
3. **智能判断**: 基于内容严重程度和历史记录自动决定处理方式
4. **即时反馈**: 违规用户立即收到警告或处理结果

## 🤖 智能Bot监听系统

### **1. 检测规则引擎**

#### **违规类型检测**
```typescript
// Spam检测
- 重复字符: "aaaaa", "!!!!!"
- 广告关键词: "buy now", "click here", "free money"
- 链接检测: 自动检测URL链接
- 商业内容: "viagra", "casino", "poker"

// Hate Speech检测  
- 暴力词汇: "kill", "die", "hate"
- 粗俗语言: "fuck", "shit", "damn"
- 歧视性语言: "racist", "sexist", "homophobic"

// Harassment检测
- 威胁词汇: "stalk", "threaten", "bully"
- 侮辱性语言: "ugly", "fat", "loser"
- 重复字符表示愤怒

// Inappropriate内容检测
- 成人内容: "sex", "porn", "nude"
- 违法内容: "drug", "alcohol", "violence"

// Advertising检测
- 推广内容: "promotion", "sale", "discount"
- 社交媒体: "follow me", "subscribe", "like"

// Scam检测
- 诈骗内容: "free money", "get rich", "investment"
- 钓鱼内容: "password", "account", "login"
- 紧急诈骗: "urgent", "limited time", "act now"
```

#### **严重程度评估**
```typescript
Critical: kill, die, threaten, violence, scam, password
High: hate, harass, bully, inappropriate, advertising  
Medium: spam, stupid, idiot, ugly
Low: damn, hell, shit
```

### **2. 自动处理机制**

#### **处理逻辑**
```typescript
if (严重程度 === 'critical') {
  立即封禁用户
} else if (严重程度 === 'high' && 24小时内违规 >= 2次) {
  自动封禁
} else if (严重程度 === 'high') {
  自动禁言
} else if (24小时内违规 >= 3次) {
  自动禁言
} else if (严重程度 === 'medium' || 'low') {
  自动警告
}
```

#### **用户状态管理**
- **Active**: 正常用户
- **Warning**: 收到警告的用户
- **Muted**: 被禁言的用户
- **Banned**: 被封禁的用户

### **3. 实时反馈系统**

#### **用户反馈**
- 违规用户立即收到警告弹窗
- 系统消息显示处理结果
- 严重违规时阻止消息发送

#### **系统消息**
```
🤖 自动审核: 用户因发送违规内容收到自动警告: Detected spam content: "buy now"
🤖 自动审核: 用户因发送高严重程度违规内容被自动禁言: Detected hate_speech content: "hate"
🤖 自动审核: 用户因发送严重违规内容被自动封禁: Detected scam content: "free money"
```

## 📊 内容审核管理

### **1. 违规记录系统**

#### **违规数据结构**
```typescript
interface ContentViolation {
  id: string;                    // 违规记录ID
  messageId: string;             // 消息ID
  userId: string;                // 用户ID
  roomId: string;                // 房间ID
  violationType: string;         // 违规类型
  severity: string;              // 严重程度
  detectedText: string;          // 检测到的文本
  reason: string;                // 违规原因
  timestamp: string;             // 时间戳
  actionTaken: string;           // 采取的行动
  reviewedBy: string;            // 审核者(bot/admin)
}
```

#### **用户违规历史**
```typescript
interface UserViolationHistory {
  userId: string;                // 用户ID
  violations: ContentViolation[]; // 违规记录
  warningCount: number;          // 警告次数
  muteCount: number;             // 禁言次数
  banCount: number;             // 封禁次数
  lastViolation: string;         // 最后违规时间
  status: string;                // 用户状态
}
```

### **2. 管理员审核界面**

#### **Content Moderation页面**
- **违规统计**: 总违规数、今日违规、本周违规
- **违规列表**: 显示所有检测到的违规内容
- **用户管理**: 查看用户违规历史
- **手动操作**: 管理员可以手动警告、禁言、封禁用户

#### **统计信息**
- **违规类型统计**: spam、hate_speech、harassment等
- **严重程度统计**: critical、high、medium、low
- **时间分布**: 今日、本周、本月违规趋势
- **用户统计**: 违规用户数量、重复违规用户

## 🛡️ 安全特性

### **1. 多层防护**
- **实时检测**: 消息发送时立即检测
- **历史分析**: 基于用户历史违规记录
- **智能判断**: 综合考虑内容严重程度和用户行为
- **自动处理**: 减少人工干预，提高效率

### **2. 数据保护**
- **本地存储**: 违规记录存储在localStorage中
- **隐私保护**: 只记录必要的违规信息
- **数据清理**: 支持定期清理过期记录

### **3. 可配置性**
- **规则调整**: 可以调整检测规则和阈值
- **处理策略**: 可以修改自动处理逻辑
- **白名单**: 支持添加信任用户白名单

## 🚀 使用方法

### **1. 自动检测**
- 用户发送消息时自动检测
- 违规内容立即被识别和处理
- 用户收到相应的警告或处理结果

### **2. 管理员管理**
1. 进入管理员面板 (`Ctrl+Shift+A`)
2. 选择"Content Moderation"
3. 查看违规统计和记录
4. 手动处理违规用户
5. 查看用户违规历史

### **3. 测试违规检测**
可以发送以下测试内容来验证检测功能：
- **Spam**: "buy now click here free money"
- **Hate Speech**: "I hate stupid people"
- **Harassment**: "you are ugly and pathetic"
- **Inappropriate**: "sex drugs violence"
- **Advertising**: "follow me for promotions"
- **Scam**: "free money investment urgent"

## 📈 系统优势

### **1. 完全自动化**
- 无需用户举报，bot自动监听
- 实时检测和处理
- 减少人工审核工作量

### **2. 智能判断**
- 基于内容严重程度智能处理
- 考虑用户历史违规记录
- 避免误判和过度处理

### **3. 全面覆盖**
- 检测多种违规类型
- 覆盖各种不当行为
- 保护聊天室环境

### **4. 用户友好**
- 清晰的警告信息
- 透明的处理流程
- 给用户改正机会

## 🔧 技术实现

### **1. 核心服务**
- **contentModerationService.ts**: 内容检测和处理服务
- **MessageInput.tsx**: 集成检测功能的消息输入组件
- **ContentModeration.tsx**: 管理员审核界面

### **2. 检测算法**
- **正则表达式匹配**: 检测特定模式
- **关键词过滤**: 识别违规词汇
- **上下文分析**: 理解内容含义
- **历史分析**: 基于用户行为模式

### **3. 数据处理**
- **实时检测**: 消息发送时立即处理
- **状态管理**: 跟踪用户违规状态
- **数据持久化**: 保存违规记录和历史

## 🎉 总结

ChatSphere的智能内容审核系统提供了：

- **🤖 智能Bot监听**: 24/7自动监听所有消息
- **🔍 多维度检测**: 检测6种主要违规类型
- **⚡ 实时处理**: 消息发送时立即检测和处理
- **🛡️ 自动防护**: 基于严重程度自动警告、禁言、封禁
- **📊 完整记录**: 详细的违规记录和用户历史
- **👨‍💼 管理界面**: 管理员可以查看和处理违规内容

这个系统确保了ChatSphere聊天室的安全和友好环境，让用户能够享受高质量的聊天体验！🚀✨
