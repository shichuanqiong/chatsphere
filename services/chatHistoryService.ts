import type { ChatHistory, PrivateChat, ChatRoom, User } from '../types';

const CHAT_HISTORY_KEY = 'chatsphere_chat_history';
const PRIVATE_CHATS_KEY = 'chatsphere_private_chats';

// 获取聊天历史
export const getChatHistory = (userId: string): ChatHistory[] => {
  const history = localStorage.getItem(CHAT_HISTORY_KEY);
  const allHistory: ChatHistory[] = history ? JSON.parse(history) : [];
  return allHistory.filter(h => h.participants.includes(userId));
};

// 保存聊天历史
const saveChatHistory = (history: ChatHistory[]) => {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
};

// 添加或更新聊天历史
export const updateChatHistory = (chatHistory: ChatHistory): void => {
  const history = localStorage.getItem(CHAT_HISTORY_KEY);
  const allHistory: ChatHistory[] = history ? JSON.parse(history) : [];
  
  const existingIndex = allHistory.findIndex(h => h.id === chatHistory.id);
  if (existingIndex >= 0) {
    allHistory[existingIndex] = chatHistory;
  } else {
    allHistory.push(chatHistory);
  }
  
  // 按最后活动时间排序
  allHistory.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  
  saveChatHistory(allHistory);
};

// 从房间创建聊天历史
export const createRoomHistory = (room: ChatRoom, userId: string): ChatHistory => {
  const participantIds = room.participants.map(p => p.id);
  if (room.host?.id) {
    participantIds.push(room.host.id);
  }
  
  return {
    id: room.id,
    type: 'room',
    name: room.name,
    participants: participantIds,
    lastActivity: room.messages.length > 0 ? room.messages[room.messages.length - 1].timestamp : new Date().toISOString(),
    messageCount: room.messages.length,
    isArchived: false,
  };
};

// 从私聊创建聊天历史
export const createPrivateHistory = (privateChat: PrivateChat, userId: string, otherUser: User): ChatHistory => {
  return {
    id: privateChat.id,
    type: 'private',
    name: otherUser.nickname,
    participants: privateChat.participants,
    lastActivity: privateChat.lastMessage?.timestamp || new Date().toISOString(),
    messageCount: privateChat.messages.length,
    isArchived: false,
  };
};

// 归档聊天
export const archiveChat = (chatId: string, userId: string): boolean => {
  const history = localStorage.getItem(CHAT_HISTORY_KEY);
  const allHistory: ChatHistory[] = history ? JSON.parse(history) : [];
  
  const chatIndex = allHistory.findIndex(h => h.id === chatId && h.participants.includes(userId));
  if (chatIndex === -1) return false;
  
  allHistory[chatIndex].isArchived = true;
  saveChatHistory(allHistory);
  
  return true;
};

// 取消归档聊天
export const unarchiveChat = (chatId: string, userId: string): boolean => {
  const history = localStorage.getItem(CHAT_HISTORY_KEY);
  const allHistory: ChatHistory[] = history ? JSON.parse(history) : [];
  
  const chatIndex = allHistory.findIndex(h => h.id === chatId && h.participants.includes(userId));
  if (chatIndex === -1) return false;
  
  allHistory[chatIndex].isArchived = false;
  saveChatHistory(allHistory);
  
  return true;
};

// 删除聊天历史
export const deleteChatHistory = (chatId: string, userId: string): boolean => {
  const history = localStorage.getItem(CHAT_HISTORY_KEY);
  const allHistory: ChatHistory[] = history ? JSON.parse(history) : [];
  
  const filteredHistory = allHistory.filter(h => !(h.id === chatId && h.participants.includes(userId)));
  if (filteredHistory.length === allHistory.length) return false;
  
  saveChatHistory(filteredHistory);
  return true;
};

// 私聊相关函数
export const getPrivateChats = (userId: string): PrivateChat[] => {
  const chats = localStorage.getItem(PRIVATE_CHATS_KEY);
  const allChats: PrivateChat[] = chats ? JSON.parse(chats) : [];
  return allChats.filter(c => c.participants.includes(userId));
};

export const savePrivateChats = (chats: PrivateChat[]) => {
  localStorage.setItem(PRIVATE_CHATS_KEY, JSON.stringify(chats));
};

export const getOrCreatePrivateChat = (userId1: string, userId2: string): PrivateChat => {
  const chats = localStorage.getItem(PRIVATE_CHATS_KEY);
  const allChats: PrivateChat[] = chats ? JSON.parse(chats) : [];
  
  const existingChat = allChats.find(c => 
    (c.participants[0] === userId1 && c.participants[1] === userId2) ||
    (c.participants[0] === userId2 && c.participants[1] === userId1)
  );
  
  if (existingChat) {
    return existingChat;
  }
  
  const newChat: PrivateChat = {
    id: `private-${userId1}-${userId2}`,
    participants: [userId1, userId2],
    messages: [],
    unreadCount: 0,
  };
  
  allChats.push(newChat);
  savePrivateChats(allChats);
  
  return newChat;
};

export const addPrivateMessage = (chatId: string, message: Omit<import('../types').PrivateMessage, 'id' | 'timestamp' | 'isRead'>): import('../types').PrivateMessage => {
  const chats = localStorage.getItem(PRIVATE_CHATS_KEY);
  const allChats: PrivateChat[] = chats ? JSON.parse(chats) : [];
  
  const chatIndex = allChats.findIndex(c => c.id === chatId);
  if (chatIndex === -1) return null as any;
  
  const newMessage: import('../types').PrivateMessage = {
    ...message,
    id: `private-msg-${Date.now()}`,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  
  allChats[chatIndex].messages.push(newMessage);
  allChats[chatIndex].lastMessage = newMessage;
  
  // 更新未读计数
  if (message.senderId !== allChats[chatIndex].participants[0]) {
    allChats[chatIndex].unreadCount++;
  }
  
  savePrivateChats(allChats);
  
  return newMessage;
};

export const markPrivateChatAsRead = (chatId: string, userId: string): void => {
  const chats = localStorage.getItem(PRIVATE_CHATS_KEY);
  const allChats: PrivateChat[] = chats ? JSON.parse(chats) : [];
  
  const chatIndex = allChats.findIndex(c => c.id === chatId);
  if (chatIndex === -1) return;
  
  // 标记所有消息为已读
  allChats[chatIndex].messages.forEach(msg => {
    if (msg.receiverId === userId) {
      msg.isRead = true;
    }
  });
  
  // 重置未读计数
  allChats[chatIndex].unreadCount = 0;
  
  savePrivateChats(allChats);
};
