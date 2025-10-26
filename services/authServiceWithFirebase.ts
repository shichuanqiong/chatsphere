import type { User, UserProfile } from '../types';
import { auth } from './firebase';
import { 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { db } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

const USERS_COLLECTION = 'users';
const CURRENT_USER_KEY = 'chatsphere_current_user';

// 导入 Firebase Authentication
import { getAuth } from 'firebase/auth';

// Guest 用户登录（匿名）
export const guestLogin = async (profile: UserProfile): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    // 使用 Firebase 匿名登录
    const userCredential = await signInAnonymously(auth);
    const firebaseUser = userCredential.user;
    
    const guestUser: User = {
      id: firebaseUser.uid,
      ...profile,
      friends: []
    };
    
    // 保存 Guest 用户数据
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guestUser));
    
    return { success: true, user: guestUser };
  } catch (error: any) {
    console.error('Guest login error:', error);
    return { success: false, message: error.message };
  }
};

// 注册用户
export const register = async (userData: Omit<User, 'id'>): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    // 检查用户名是否已存在（简化版，实际应该用 Firestore 查询）
    const users = getUsers();
    if (users.some(u => u.nickname.toLowerCase() === userData.nickname.toLowerCase())) {
      return { success: false, message: 'Nickname already taken.' };
    }
    if (users.some(u => u.email?.toLowerCase() === userData.email?.toLowerCase())) {
      return { success: false, message: 'Email already registered.' };
    }

    // 使用 Firebase 创建用户
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email!,
      userData.password!
    );
    
    const firebaseUser = userCredential.user;
    
    const newUser: User = {
      ...userData,
      id: firebaseUser.uid,
      friends: []
    };

    // 保存到 Firestore
    await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), newUser);
    
    // 保存到 localStorage（兼容性）
    users.push(newUser);
    saveUsers(users);
    
    // Log in the new user immediately
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return { success: true, message: 'Registration successful!', user: newUser };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, message: error.message };
  }
};

// 用户登录
export const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    // 使用 Firebase 登录
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // 从 Firestore 获取用户数据
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return { success: false, message: 'User not found.' };
    }
    
    const user = userDoc.data() as User;
    
    // 保存到 localStorage
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return { success: true, message: 'Login successful!', user };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, message: error.message };
  }
};

// 登出
export const logout = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
  localStorage.removeItem(CURRENT_USER_KEY);
};

// 获取当前用户
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// 临时保持localStorage兼容性
const getUsers = (): User[] => {
  const users = localStorage.getItem('chatsphere_users');
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem('chatsphere_users', JSON.stringify(users));
};

// 获取所有用户
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return usersSnapshot.docs.map(doc => doc.data() as User);
  } catch (error) {
    console.error('Error getting users:', error);
    // Fallback to localStorage
    return getUsers().filter(u => !!u.id);
  }
};

// 其他函数保持不变...
export const addFriend = (currentUserId: string, friendId: string): { success: boolean; user?: User, message?: string } => {
    if (currentUserId.startsWith('guest-')) {
        return { success: false, message: 'Guest users cannot add friends.' };
    }
    const users = getUsers();
    // ... 保持原有逻辑
};

export const removeFriend = (currentUserId: string, friendId: string): { success: boolean; message?: string; user?: User } => {
    const users = getUsers();
    // ... 保持原有逻辑
};

export const updateUserProfile = (userId: string, profileData: Partial<UserProfile>): { success: boolean; user?: User; message?: string } => {
  const users = getUsers();
  // ... 保持原有逻辑
};

export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};

export const searchUsers = (query: string, currentUserId: string): User[] => {
  const users = getUsers();
  // ... 保持原有逻辑
};

export const getMutualFriends = (userId1: string, userId2: string): User[] => {
  const users = getUsers();
  // ... 保持原有逻辑
};

export const blockUser = (currentUserId: string, blockedUserId: string): { success: boolean; user?: User, message?: string } => {
  if (currentUserId.startsWith('guest-')) {
    const guestBlockedKey = `guest_blocked_${currentUserId}`;
    const blockedUsers = JSON.parse(localStorage.getItem(guestBlockedKey) || '[]');
    // ... 保持原有逻辑
  }
  const users = getUsers();
  // ... 保持原有逻辑
};

export const unblockUser = (currentUserId: string, unblockedUserId: string): { success: boolean; user?: User, message?: string } => {
  if (currentUserId.startsWith('guest-')) {
    const guestBlockedKey = `guest_blocked_${currentUserId}`;
    const blockedUsers = JSON.parse(localStorage.getItem(guestBlockedKey) || '[]');
    // ... 保持原有逻辑
  }
  const users = getUsers();
  // ... 保持原有逻辑
};

export const isUserBlocked = (currentUserId: string, targetUserId: string): boolean => {
  if (currentUserId.startsWith('guest-')) {
    const guestBlockedKey = `guest_blocked_${currentUserId}`;
    const blockedUsers = JSON.parse(localStorage.getItem(guestBlockedKey) || '[]');
    return blockedUsers.includes(targetUserId);
  }
  
  const users = getUsers();
  const currentUser = users.find(u => u.id === currentUserId);
  
  if (!currentUser || !currentUser.blocked) {
    return false;
  }
  
  return currentUser.blocked.includes(targetUserId);
};
