// Represents a registered user or a guest
export interface User {
  id?: string; // Registered users have an ID, guests do not.
  nickname: string;
  email?: string; // Required for registration
  password?: string; // Only used for registration/login, not stored in active state
  age: number;
  gender: string;
  country: string;
  friends?: string[]; // Array of user IDs
  blocked?: string[]; // Array of blocked user IDs
  avatar?: string; // URL for the user's avatar
  bio?: string; // A short user biography
}

// FIX: Define UserProfile type to resolve import errors.
export type UserProfile = Omit<User, 'id' | 'password'>;


// Represents a chat room created by a user
export interface ChatRoom {
  id:string;
  name: string;
  host?: User; // Host is optional for official rooms
  hostId?: string; // Host user ID for easier filtering
  participants: User[];
  messages: Message[];
  isOfficial?: boolean; // Flag for official rooms
  createdAt?: string; // When the room was created
  roomType?: 'public' | 'private'; // Room visibility type
  invitedUsers?: string[]; // Array of invited user IDs for private rooms
  icon?: string; // Custom icon for user-created rooms
}

export interface Message {
  id: string;
  text?: string; // Text is now optional for image-based messages
  imageUrl?: string; // To support GIFs
  sender: User; // Sender is always a user
  timestamp: string;
  isRead?: boolean; // Track if message has been read
}

// 私聊消息类型
export interface PrivateMessage {
  id: string;
  text?: string;
  imageUrl?: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  isRead: boolean;
}

// 私聊会话类型
export interface PrivateChat {
  id: string;
  participants: [string, string]; // 两个用户ID
  messages: PrivateMessage[];
  lastMessage?: PrivateMessage;
  unreadCount: number;
}

// 通知类型
export interface Notification {
  id: string;
  type: 'friend_request' | 'message' | 'room_invite' | 'system';
  title: string;
  message: string;
  userId: string;
  timestamp: string;
  isRead: boolean;
  actionData?: {
    friendId?: string;
    roomId?: string;
    chatId?: string;
  };
}

// 聊天历史类型
export interface ChatHistory {
  id: string;
  type: 'room' | 'private' | 'bot';
  name: string;
  participants: string[];
  lastActivity: string;
  messageCount: number;
  isArchived: boolean;
}