import type { Notification } from '../types';

const NOTIFICATIONS_KEY = 'chatsphere_notifications';

// 获取用户的所有通知
export const getNotifications = (userId: string): Notification[] => {
  const notifications = localStorage.getItem(NOTIFICATIONS_KEY);
  const allNotifications: Notification[] = notifications ? JSON.parse(notifications) : [];
  return allNotifications.filter(n => n.userId === userId);
};

// 保存通知
const saveNotifications = (notifications: Notification[]) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

// 添加新通知
export const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): Notification => {
  const notifications = localStorage.getItem(NOTIFICATIONS_KEY);
  const allNotifications: Notification[] = notifications ? JSON.parse(notifications) : [];
  
  const newNotification: Notification = {
    ...notification,
    id: `notification-${Date.now()}`,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  
  allNotifications.push(newNotification);
  saveNotifications(allNotifications);
  
  return newNotification;
};

// 标记通知为已读
export const markNotificationAsRead = (notificationId: string): boolean => {
  const notifications = localStorage.getItem(NOTIFICATIONS_KEY);
  const allNotifications: Notification[] = notifications ? JSON.parse(notifications) : [];
  
  const notificationIndex = allNotifications.findIndex(n => n.id === notificationId);
  if (notificationIndex === -1) return false;
  
  allNotifications[notificationIndex].isRead = true;
  saveNotifications(allNotifications);
  
  return true;
};

// 标记所有通知为已读
export const markAllNotificationsAsRead = (userId: string): void => {
  const notifications = localStorage.getItem(NOTIFICATIONS_KEY);
  const allNotifications: Notification[] = notifications ? JSON.parse(notifications) : [];
  
  const updatedNotifications = allNotifications.map(n => 
    n.userId === userId ? { ...n, isRead: true } : n
  );
  
  saveNotifications(updatedNotifications);
};

// 删除通知
export const deleteNotification = (notificationId: string): boolean => {
  const notifications = localStorage.getItem(NOTIFICATIONS_KEY);
  const allNotifications: Notification[] = notifications ? JSON.parse(notifications) : [];
  
  const filteredNotifications = allNotifications.filter(n => n.id !== notificationId);
  if (filteredNotifications.length === allNotifications.length) return false;
  
  saveNotifications(filteredNotifications);
  return true;
};

// 获取未读通知数量
export const getUnreadNotificationCount = (userId: string): number => {
  const userNotifications = getNotifications(userId);
  return userNotifications.filter(n => !n.isRead).length;
};

// 创建好友请求通知
export const createFriendRequestNotification = (fromUserId: string, toUserId: string, fromUserNickname: string): Notification => {
  return addNotification({
    type: 'friend_request',
    title: 'New Friend Request',
    message: `${fromUserNickname} wants to be your friend`,
    userId: toUserId,
    actionData: { friendId: fromUserId },
  });
};

// 创建私聊消息通知
export const createMessageNotification = (fromUserId: string, toUserId: string, fromUserNickname: string, messagePreview: string): Notification => {
  return addNotification({
    type: 'message',
    title: `Message from ${fromUserNickname}`,
    message: messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview,
    userId: toUserId,
    actionData: { chatId: `private-${fromUserId}-${toUserId}` },
  });
};

// 创建房间邀请通知
export const createRoomInviteNotification = (fromUserId: string, toUserId: string, fromUserNickname: string, roomName: string): Notification => {
  return addNotification({
    type: 'room_invite',
    title: 'Room Invitation',
    message: `${fromUserNickname} invited you to join "${roomName}"`,
    userId: toUserId,
    actionData: { roomId: `room-${Date.now()}` },
  });
};
