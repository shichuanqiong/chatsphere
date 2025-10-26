// 内容检测和自动审核服务
export interface ContentViolation {
  id: string;
  messageId: string;
  userId: string;
  roomId: string;
  violationType: 'spam' | 'hate_speech' | 'harassment' | 'inappropriate' | 'advertising' | 'scam';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedText: string;
  reason: string;
  timestamp: string;
  actionTaken?: 'warning' | 'mute' | 'ban' | 'none';
  reviewedBy?: string; // 'bot' | 'admin'
}

export interface UserViolationHistory {
  userId: string;
  violations: ContentViolation[];
  warningCount: number;
  muteCount: number;
  banCount: number;
  lastViolation?: string;
  status: 'active' | 'muted' | 'banned' | 'warning';
}

// 管理员设置
const MODERATION_SETTINGS_KEY = 'chatsphere_moderation_settings';

export interface ModerationSettings {
  enabled: boolean;
  strictMode: boolean;
  spamDetection: boolean;
  hateSpeechDetection: boolean;
  harassmentDetection: boolean;
  inappropriateDetection: boolean;
  advertisingDetection: boolean;
  scamDetection: boolean;
}

export const getModerationSettings = (): ModerationSettings => {
  const settings = localStorage.getItem(MODERATION_SETTINGS_KEY);
  if (settings) {
    return JSON.parse(settings);
  }
  
  // 默认设置：暂时禁用
  const defaultSettings: ModerationSettings = {
    enabled: false, // 暂时禁用
    strictMode: false,
    spamDetection: true,
    hateSpeechDetection: false,
    harassmentDetection: false,
    inappropriateDetection: false,
    advertisingDetection: false,
    scamDetection: true
  };
  
  localStorage.setItem(MODERATION_SETTINGS_KEY, JSON.stringify(defaultSettings));
  return defaultSettings;
};

export const updateModerationSettings = (settings: Partial<ModerationSettings>): void => {
  const currentSettings = getModerationSettings();
  const newSettings = { ...currentSettings, ...settings };
  localStorage.setItem(MODERATION_SETTINGS_KEY, JSON.stringify(newSettings));
};

// 不当语言检测规则 - 优化版本
const VIOLATION_PATTERNS = {
  spam: [
    /\b(buy now|click here|free money|make money|earn cash|get rich quick)\b/i,
    /\b(viagra|casino|poker|lottery|investment opportunity)\b/i,
    /(.)\1{6,}/, // 重复字符超过6个
    /https?:\/\/[^\s]+/g, // 链接
    /\b(follow me|subscribe|like and share|promotion|sale|discount)\b/i
  ],
  hate_speech: [
    // 更严格的仇恨言论检测
    /\b(kill yourself|die in hell|you should die|go die)\b/i,
    /\b(racist|sexist|homophobic|transphobic)\b/i,
    /\b(nazi|hitler|white supremacy)\b/i,
    /\b(terrorist|bomb|attack|murder)\b/i
  ],
  harassment: [
    // 更严重的骚扰行为
    /\b(stalk you|threaten you|bully you|harass you)\b/i,
    /\b(I will hurt you|I will kill you|I will find you)\b/i,
    /\b(ugly bitch|fat pig|stupid whore|pathetic loser)\b/i,
    /(.)\1{5,}/ // 重复字符表示极度愤怒
  ],
  inappropriate: [
    // 更明确的成人内容
    /\b(porn|pornography|nude photos|sex videos)\b/i,
    /\b(drug dealing|buy drugs|sell drugs)\b/i,
    /\b(violence against|physical harm|beat you up)\b/i
  ],
  advertising: [
    // 明确的商业推广
    /\b(promotion code|discount code|limited offer|act now)\b/i,
    /\b(follow my instagram|subscribe to my channel|check my website)\b/i,
    /\b(contact me for business|DM for details|business inquiry)\b/i
  ],
  scam: [
    // 明确的诈骗内容
    /\b(free money|get rich|crypto investment|bitcoin)\b/i,
    /\b(password reset|account verification|login required)\b/i,
    /\b(urgent action|limited time|act immediately)\b/i,
    /\b(wire transfer|send money|payment required)\b/i
  ]
};

// 日常表达白名单 - 扩展版本
const COMMON_EXPRESSIONS = [
  // 基本日常表达
  /\b(fuck this|damn it|hell yeah|shit happens)\b/i,
  /\b(oh my god|what the hell|holy shit)\b/i,
  /\b(this is stupid|that's ugly|what an idiot)\b/i,
  /\b(kill me|I'm dying|this is hell)\b/i,
  /\b(damn good|hell of a|shit ton)\b/i,
  /\b(fucking awesome|damn right|hell no)\b/i,
  
  // 扩展的日常表达
  /\b(motherfucker|moron|stupid|idiot)\b/i,
  /\b(fuck off|fuck you|fuck that)\b/i,
  /\b(shit|damn|hell|fuck)\b/i,
  /\b(kill|die|death)\b/i,
  
  // 故事/剧情表达
  /\b(he killed|she killed|they killed|someone killed)\b/i,
  /\b(he died|she died|they died|someone died)\b/i,
  /\b(he fucked|she fucked|they fucked|someone fucked)\b/i,
  /\b(he said shit|she said shit|they said shit)\b/i,
  /\b(he called|she called|they called)\s+(him|her|them)\s+(stupid|idiot|moron)\b/i,
  
  // 游戏/娱乐表达
  /\b(kill the boss|kill enemies|kill monsters)\b/i,
  /\b(die in game|died in battle|killed by)\b/i,
  /\b(fuck this game|damn game|shit game)\b/i,
  
  // 电影/书籍表达
  /\b(in the movie|in the book|in the story)\b/i,
  /\b(the character|the protagonist|the villain)\b/i,
  /\b(he was killed|she was killed|they were killed)\b/i,
  
  // 新闻/事件表达
  /\b(in the news|on the news|news said)\b/i,
  /\b(according to|it was reported|they reported)\b/i,
  /\b(the incident|the accident|the event)\b/i
];

// 故事/剧情上下文检测
const STORY_CONTEXT = [
  /\b(once upon a time|in the story|in the movie|in the book)\b/i,
  /\b(the character|the protagonist|the villain|the hero)\b/i,
  /\b(he said|she said|they said|someone said)\b/i,
  /\b(he did|she did|they did|someone did)\b/i,
  /\b(he was|she was|they were|someone was)\b/i,
  /\b(in the game|in the movie|in the book|in the story)\b/i,
  /\b(according to|it was reported|they reported)\b/i,
  /\b(the news|the incident|the accident|the event)\b/i,
  /\b(imagine|suppose|what if|let's say)\b/i,
  /\b(if someone|if he|if she|if they)\b/i
];

// 上下文分析 - 检测是否在攻击他人
const HARASSMENT_CONTEXT = [
  /\b(you are|you're|you look|you sound)\s+(stupid|ugly|fat|idiot|loser)\b/i,
  /\b(go kill yourself|you should die|I hate you)\b/i,
  /\b(shut up|shut the fuck up|fuck off)\b/i
];

// 严重程度评估 - 更智能的判断
const SEVERITY_KEYWORDS = {
  critical: [
    'kill yourself', 'die in hell', 'go die', 'murder', 'bomb', 'terrorist',
    'nazi', 'hitler', 'white supremacy', 'scam', 'fraud', 'steal money'
  ],
  high: [
    'threaten', 'stalk', 'bully', 'harass', 'racist', 'sexist', 'homophobic',
    'pornography', 'drug dealing', 'violence against', 'beat you up'
  ],
  medium: [
    'spam', 'advertising', 'promotion', 'follow me', 'subscribe',
    'inappropriate', 'adult content'
  ],
  low: [
    'stupid', 'idiot', 'ugly', 'damn', 'hell', 'shit', 'fuck'
  ]
};

// 检测消息内容 - 智能版本（仅限房间，受管理员设置控制）
export const detectContentViolations = (messageText: string, isPrivateChat: boolean = false): ContentViolation[] => {
  const violations: ContentViolation[] = [];
  
  // 获取管理员设置
  const settings = getModerationSettings();
  
  // 如果内容检测被禁用，直接返回
  if (!settings.enabled) {
    return violations;
  }
  
  // 私聊不进行内容检测
  if (isPrivateChat) {
    return violations;
  }
  
  if (!messageText || messageText.trim().length === 0) {
    return violations;
  }
  
  const text = messageText.toLowerCase();
  
  // 首先检查是否在常见表达白名单中
  const isCommonExpression = COMMON_EXPRESSIONS.some(pattern => pattern.test(text));
  if (isCommonExpression) {
    return violations; // 如果是常见表达，不检测为违规
  }
  
  // 检查是否在故事/剧情上下文中
  const isStoryContext = STORY_CONTEXT.some(pattern => pattern.test(text));
  
  // 检查是否在骚扰上下文中（针对他人的攻击）
  const isHarassmentContext = HARASSMENT_CONTEXT.some(pattern => pattern.test(text));
  
  // 检查每种违规类型（根据设置）
  Object.entries(VIOLATION_PATTERNS).forEach(([type, patterns]) => {
    // 检查该类型是否启用
    const typeEnabled = settings[`${type}Detection` as keyof ModerationSettings];
    if (!typeEnabled) {
      return; // 如果该类型检测被禁用，跳过
    }
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        // 对于骚扰类型，需要确认是在攻击他人
        if (type === 'harassment' && !isHarassmentContext) {
          return; // 如果不是在攻击他人，跳过
        }
        
        // 如果在故事上下文中，降低严重程度
        const severity = determineSeverity(text, type as any, isHarassmentContext, isStoryContext);
        
        // 只对spam和scam进行警告，其他类型更宽松
        if (type === 'spam' || type === 'scam') {
          // 对于spam和scam，即使严重程度较低也报告
          violations.push({
            id: `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            messageId: '', // 将在调用时设置
            userId: '', // 将在调用时设置
            roomId: '', // 将在调用时设置
            violationType: type as any,
            severity,
            detectedText: matches[0],
            reason: `Detected ${type} content: "${matches[0]}"`,
            timestamp: new Date().toISOString(),
            reviewedBy: 'bot'
          });
        } else if (severity === 'high' || severity === 'critical') {
          // 对于其他类型，只有高严重程度才报告
          violations.push({
            id: `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            messageId: '', // 将在调用时设置
            userId: '', // 将在调用时设置
            roomId: '', // 将在调用时设置
            violationType: type as any,
            severity,
            detectedText: matches[0],
            reason: `Detected ${type} content: "${matches[0]}"`,
            timestamp: new Date().toISOString(),
            reviewedBy: 'bot'
          });
        }
      }
    });
  });
  
  return violations;
};

// 确定严重程度 - 智能版本
const determineSeverity = (text: string, violationType: string, isHarassmentContext: boolean = false, isStoryContext: boolean = false): 'low' | 'medium' | 'high' | 'critical' => {
  // 检查关键词严重程度
  for (const [severity, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      // 如果是骚扰上下文，提高严重程度
      if (isHarassmentContext && severity === 'low') {
        return 'medium';
      }
      
      // 如果是故事上下文，降低严重程度
      if (isStoryContext && severity === 'critical') {
        return 'high';
      } else if (isStoryContext && severity === 'high') {
        return 'medium';
      } else if (isStoryContext && severity === 'medium') {
        return 'low';
      }
      
      return severity as any;
    }
  }
  
  // 基于违规类型确定默认严重程度
  const defaultSeverity = {
    spam: 'medium',
    hate_speech: 'high',
    harassment: isHarassmentContext ? 'high' : 'low',
    inappropriate: 'medium',
    advertising: 'low',
    scam: 'critical'
  };
  
  let severity = defaultSeverity[violationType as keyof typeof defaultSeverity] as any;
  
  // 如果是故事上下文，进一步降低严重程度
  if (isStoryContext) {
    if (severity === 'critical') severity = 'high';
    else if (severity === 'high') severity = 'medium';
    else if (severity === 'medium') severity = 'low';
  }
  
  return severity;
};

// 用户违规历史管理
const VIOLATION_HISTORY_KEY = 'chatsphere_violation_history';

export const getUserViolationHistory = (userId: string): UserViolationHistory => {
  const history = localStorage.getItem(VIOLATION_HISTORY_KEY);
  const allHistory = history ? JSON.parse(history) : {};
  
  return allHistory[userId] || {
    userId,
    violations: [],
    warningCount: 0,
    muteCount: 0,
    banCount: 0,
    status: 'active'
  };
};

export const updateUserViolationHistory = (userId: string, violation: ContentViolation): void => {
  const history = getUserViolationHistory(userId);
  
  history.violations.push(violation);
  history.lastViolation = violation.timestamp;
  
  // 更新统计
  switch (violation.actionTaken) {
    case 'warning':
      history.warningCount++;
      history.status = 'warning';
      break;
    case 'mute':
      history.muteCount++;
      history.status = 'muted';
      break;
    case 'ban':
      history.banCount++;
      history.status = 'banned';
      break;
  }
  
  // 保存更新
  const allHistory = JSON.parse(localStorage.getItem(VIOLATION_HISTORY_KEY) || '{}');
  allHistory[userId] = history;
  localStorage.setItem(VIOLATION_HISTORY_KEY, JSON.stringify(allHistory));
};

// 自动处理违规 - 更宽松的版本，英文消息
export const autoHandleViolation = (violation: ContentViolation): string => {
  const userHistory = getUserViolationHistory(violation.userId);
  const recentViolations = userHistory.violations.filter(v => 
    new Date(v.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000 // 24小时内
  );
  
  let action: 'warning' | 'mute' | 'ban' | 'none' = 'none';
  let message = '';
  
  // 基于严重程度和历史记录决定行动 - 更宽松的策略
  if (violation.severity === 'critical') {
    // 只有真正的严重违规才封禁
    if (recentViolations.length >= 3) {
      action = 'ban';
      message = `User automatically banned for multiple severe violations: ${violation.reason}`;
    } else {
      action = 'mute';
      message = `User automatically muted for severe violation: ${violation.reason}`;
    }
  } else if (violation.severity === 'high') {
    // 高严重程度需要多次违规才处理
    if (recentViolations.length >= 3) {
      action = 'mute';
      message = `User automatically muted for multiple high-severity violations: ${violation.reason}`;
    } else {
      action = 'warning';
      message = `User received automatic warning for high-severity violation: ${violation.reason}`;
    }
  } else if (violation.severity === 'medium') {
    // 中等严重程度需要更多次违规
    if (recentViolations.length >= 5) {
      action = 'warning';
      message = `User received automatic warning for multiple violations: ${violation.reason}`;
    } else {
      action = 'none';
      message = `Violation detected but no action taken: ${violation.reason}`;
    }
  } else {
    // 低严重程度基本不处理
    action = 'none';
    message = `Minor violation detected but no action taken: ${violation.reason}`;
  }
  
  // 更新违规记录
  violation.actionTaken = action;
  updateUserViolationHistory(violation.userId, violation);
  
  return message;
};

// 获取所有违规记录
export const getAllViolations = (): ContentViolation[] => {
  const history = localStorage.getItem(VIOLATION_HISTORY_KEY);
  const allHistory = history ? JSON.parse(history) : {};
  
  const allViolations: ContentViolation[] = [];
  Object.values(allHistory).forEach((userHistory: any) => {
    allViolations.push(...userHistory.violations);
  });
  
  return allViolations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// 获取违规统计
export const getViolationStats = () => {
  const violations = getAllViolations();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const todayViolations = violations.filter(v => new Date(v.timestamp) >= today);
  const weekViolations = violations.filter(v => new Date(v.timestamp) >= thisWeek);
  
  const typeStats = violations.reduce((acc, v) => {
    acc[v.violationType] = (acc[v.violationType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const severityStats = violations.reduce((acc, v) => {
    acc[v.severity] = (acc[v.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: violations.length,
    today: todayViolations.length,
    thisWeek: weekViolations.length,
    typeStats,
    severityStats
  };
};
