import type { User, UserProfile } from '../types';
import { createFriendRequestNotification } from './notificationService';

const USERS_KEY = 'chatsphere_users';
const CURRENT_USER_KEY = 'chatsphere_current_user';

// Function to get all users from localStorage
const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Function to save all users to localStorage
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const register = (userData: Omit<User, 'id'>): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  if (users.some(u => u.nickname.toLowerCase() === userData.nickname.toLowerCase())) {
    return { success: false, message: 'Nickname already taken.' };
  }
  if (users.some(u => u.email?.toLowerCase() === userData.email?.toLowerCase())) {
    return { success: false, message: 'Email already registered.' };
  }

  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    friends: [],
  };

  users.push(newUser);
  saveUsers(users);
  
  // Log in the new user immediately
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

  return { success: true, message: 'Registration successful!', user: newUser };
};

export const login = (nickname: string, password?: string): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  const user = users.find(u => u.nickname.toLowerCase() === nickname.toLowerCase());

  if (!user) {
    return { success: false, message: 'User not found.' };
  }
  
  // NOTE: In a real app, you would hash and compare passwords.
  // For this simulation, we check if the stored password matches.
  if (user.password !== password) {
      return { success: false, message: 'Invalid password.'}
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, message: 'Login successful!', user };
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const getAllUsers = (): User[] => {
    return getUsers().filter(u => !!u.id); // Return all users (registered + guest)
};

export const addFriend = (currentUserId: string, friendId: string): { success: boolean; user?: User, message?: string } => {
    // Check if current user is a guest
    if (currentUserId.startsWith('guest-')) {
        return { success: false, message: 'Guest users cannot add friends.' };
    }

    const users = getUsers();
    const currentUserIndex = users.findIndex(u => u.id === currentUserId);
    const friendIndex = users.findIndex(u => u.id === friendId);

    if (currentUserIndex === -1) {
        return { success: false, message: 'Current user not found.' };
    }

    if (friendIndex === -1) {
        return { success: false, message: 'Friend not found.' };
    }

    const currentUser = users[currentUserIndex];
    const friend = users[friendIndex];
    
    if (!currentUser.friends) {
        currentUser.friends = [];
    }
    
    if (currentUser.friends.includes(friendId)) {
        return { success: false, message: 'User is already a friend.', user: currentUser };
    }

    currentUser.friends.push(friendId);
    users[currentUserIndex] = currentUser;
    saveUsers(users);
    
    // Update the currently logged-in user's data in localStorage
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

    // Create friend request notification
    createFriendRequestNotification(currentUserId, friendId, currentUser.nickname);

    return { success: true, user: currentUser };
};

export const removeFriend = (currentUserId: string, friendId: string): { success: boolean; message?: string; user?: User } => {
    const users = getUsers();
    const currentUserIndex = users.findIndex(u => u.id === currentUserId);
    const friendIndex = users.findIndex(u => u.id === friendId);

    if (currentUserIndex === -1) {
        return { success: false, message: 'Current user not found.' };
    }

    if (friendIndex === -1) {
        return { success: false, message: 'Friend not found.' };
    }

    const currentUser = users[currentUserIndex];
    
    if (!currentUser.friends) {
        currentUser.friends = [];
    }
    
    const friendIndexInList = currentUser.friends.indexOf(friendId);
    if (friendIndexInList === -1) {
        return { success: false, message: 'User is not a friend.', user: currentUser };
    }

    currentUser.friends.splice(friendIndexInList, 1);
    users[currentUserIndex] = currentUser;
    saveUsers(users);
    
    // Update the currently logged-in user's data in localStorage
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

    return { success: true, user: currentUser };
};

export const updateUserProfile = (userId: string, profileData: Partial<UserProfile>): { success: boolean; user?: User; message?: string } => {
  const users = getUsers();
  const currentUserIndex = users.findIndex(u => u.id === userId);

  if (currentUserIndex === -1) {
    return { success: false, message: 'User not found.' };
  }

  // Check for nickname uniqueness if it's being changed
  if (profileData.nickname) {
    const isNicknameTaken = users.some(u => u.id !== userId && u.nickname.toLowerCase() === profileData.nickname!.toLowerCase());
    if (isNicknameTaken) {
      return { success: false, message: 'Nickname is already taken.' };
    }
  }

  const updatedUser = { ...users[currentUserIndex], ...profileData };
  users[currentUserIndex] = updatedUser;
  saveUsers(users);

  // Update the currently logged-in user's data in localStorage
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

  return { success: true, user: updatedUser, message: 'Profile updated successfully.' };
};

// Get user by ID
export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};

// Search users by nickname
export const searchUsers = (query: string, currentUserId: string): User[] => {
  const users = getUsers();
  const currentUser = users.find(u => u.id === currentUserId);
  
  if (!currentUser) return [];
  
  const friends = currentUser.friends || [];
  
  return users.filter(u => 
    u.id !== currentUserId && 
    u.nickname.toLowerCase().includes(query.toLowerCase()) &&
    !friends.includes(u.id!)
  );
};

// Get mutual friends
export const getMutualFriends = (userId1: string, userId2: string): User[] => {
  const users = getUsers();
  const user1 = users.find(u => u.id === userId1);
  const user2 = users.find(u => u.id === userId2);
  
  if (!user1 || !user2) return [];
  
  const friends1 = user1.friends || [];
  const friends2 = user2.friends || [];
  
  const mutualFriendIds = friends1.filter(id => friends2.includes(id));
  
  return users.filter(u => mutualFriendIds.includes(u.id!));
};

// Block a user
export const blockUser = (currentUserId: string, blockedUserId: string): { success: boolean; user?: User, message?: string } => {
  // Guest users can block other users, but we need to handle it differently
  if (currentUserId.startsWith('guest-')) {
    // For guest users, we'll store the block list in a separate key
    const guestBlockedKey = `guest_blocked_${currentUserId}`;
    const blockedUsers = JSON.parse(localStorage.getItem(guestBlockedKey) || '[]');
    
    if (blockedUsers.includes(blockedUserId)) {
      return { success: false, message: 'User is already blocked.' };
    }
    
    blockedUsers.push(blockedUserId);
    localStorage.setItem(guestBlockedKey, JSON.stringify(blockedUsers));
    
    // Return a mock user object for guest
    const guestUser: User = {
      id: currentUserId,
      nickname: currentUserId.replace('guest-', ''),
      age: 0,
      gender: 'Other',
      country: '',
      blocked: blockedUsers
    };
    
    return { success: true, user: guestUser };
  }

  const users = getUsers();
  const currentUserIndex = users.findIndex(u => u.id === currentUserId);
  const blockedUserIndex = users.findIndex(u => u.id === blockedUserId);

  if (currentUserIndex === -1) {
    return { success: false, message: 'Current user not found.' };
  }

  if (blockedUserIndex === -1) {
    return { success: false, message: 'User to block not found.' };
  }

  const currentUser = users[currentUserIndex];
  
  if (!currentUser.blocked) {
    currentUser.blocked = [];
  }
  
  if (currentUser.blocked.includes(blockedUserId)) {
    return { success: false, message: 'User is already blocked.', user: currentUser };
  }

  currentUser.blocked.push(blockedUserId);
  users[currentUserIndex] = currentUser;
  saveUsers(users);
  
  // Update the currently logged-in user's data in localStorage
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  return { success: true, user: currentUser };
};

// Unblock a user
export const unblockUser = (currentUserId: string, unblockedUserId: string): { success: boolean; user?: User, message?: string } => {
  // Guest users can unblock other users
  if (currentUserId.startsWith('guest-')) {
    const guestBlockedKey = `guest_blocked_${currentUserId}`;
    const blockedUsers = JSON.parse(localStorage.getItem(guestBlockedKey) || '[]');
    
    const blockedIndex = blockedUsers.indexOf(unblockedUserId);
    if (blockedIndex === -1) {
      return { success: false, message: 'User is not blocked.' };
    }
    
    blockedUsers.splice(blockedIndex, 1);
    localStorage.setItem(guestBlockedKey, JSON.stringify(blockedUsers));
    
    // Return a mock user object for guest
    const guestUser: User = {
      id: currentUserId,
      nickname: currentUserId.replace('guest-', ''),
      age: 0,
      gender: 'Other',
      country: '',
      blocked: blockedUsers
    };
    
    return { success: true, user: guestUser };
  }

  const users = getUsers();
  const currentUserIndex = users.findIndex(u => u.id === currentUserId);

  if (currentUserIndex === -1) {
    return { success: false, message: 'Current user not found.' };
  }

  const currentUser = users[currentUserIndex];
  
  if (!currentUser.blocked) {
    return { success: false, message: 'User is not blocked.', user: currentUser };
  }
  
  const blockedIndex = currentUser.blocked.indexOf(unblockedUserId);
  if (blockedIndex === -1) {
    return { success: false, message: 'User is not blocked.', user: currentUser };
  }

  currentUser.blocked.splice(blockedIndex, 1);
  users[currentUserIndex] = currentUser;
  saveUsers(users);
  
  // Update the currently logged-in user's data in localStorage
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  return { success: true, user: currentUser };
};

// Check if a user is blocked
export const isUserBlocked = (currentUserId: string, targetUserId: string): boolean => {
  // Handle guest users
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