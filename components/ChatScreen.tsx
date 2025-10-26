import React, { useState, useEffect, useCallback } from 'react';
import { User, Message, ChatRoom, UserProfile, PrivateChat } from '../types';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import ChatWindow from './ChatWindow';
import PrivateChatWindow from './PrivateChatWindow';
import Inbox from './Inbox';
import ChatHistory from './ChatHistory';
import AdPlaceholder from './AdPlaceholder';
import CreateRoomModal from './CreateRoomModal';
import AddFriendModal from './AddFriendModal';
import EditProfileModal from './EditProfileModal';
import UserProfileModal from './UserProfileModal';
import InviteUserModal from './InviteUserModal';
import { OFFICIAL_ROOMS } from '../constants';
import { addFriend, removeFriend, getAllUsers, updateUserProfile, blockUser, unblockUser, isUserBlocked } from '../services/authService';
import { getOrCreatePrivateChat, addPrivateMessage } from '../services/chatHistoryService';
import { 
  createRoom, 
  updateRoom, 
  addMessageToRoom, 
  joinRoom, 
  leaveRoom, 
  getAllActiveRooms, 
  getUserCreatedRooms,
  isUserInRoom,
  getRoomById,
  addOfficialRoomMessage,
  getOfficialRoomWithMessages,
  cleanupExpiredOfficialMessages,
  getStorageUsage,
  forceCleanupAllExpiredData,
  canUserCreateRoom
} from '../services/roomService';
import { MenuIcon, LogoutIcon, SpinnerIcon } from './icons';

interface ChatScreenProps {
  user: User;
  onLogout: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ user: initialUser, onLogout }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [activeChat, setActiveChat] = useState<{ type: 'room'; data: ChatRoom } | { type: 'private'; data: PrivateChat; otherUser: User } | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [userCreatedRooms, setUserCreatedRooms] = useState<ChatRoom[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
  const [isAddFriendModalOpen, setAddFriendModalOpen] = useState(false);
  const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [isUserProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isInviteUserModalOpen, setInviteUserModalOpen] = useState(false);
  const [selectedRoomForInvite, setSelectedRoomForInvite] = useState<ChatRoom | null>(null);
  const [unreadChats, setUnreadChats] = useState<Set<string>>(new Set());
  const [lastReadMessageCount, setLastReadMessageCount] = useState<Map<string, number>>(new Map());
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [unreadPrivateMessages, setUnreadPrivateMessages] = useState<number>(0);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  const isGuest = user.id?.startsWith('guest-') || false;
  
  const allRooms = rooms;

  // 加载房间数据
  useEffect(() => {
    const loadRooms = () => {
      // 清理过期的官方房间消息
      cleanupExpiredOfficialMessages();
      
      // 检查存储使用情况
      const storageUsage = getStorageUsage();
      if (storageUsage.percentage > 80) {
        console.warn('Storage usage is high:', storageUsage.percentage.toFixed(2) + '%');
        forceCleanupAllExpiredData();
      }
      
      // 为官方房间加载额外消息
      const officialRoomsWithMessages = OFFICIAL_ROOMS.map(room => getOfficialRoomWithMessages(room));
      const userRooms = getAllActiveRooms([]); // 只获取用户房间
      const allRooms = [...officialRoomsWithMessages, ...userRooms];
      
      setRooms(allRooms);
      
      if (!isGuest && user.id) {
        const userCreatedRooms = getUserCreatedRooms(user.id);
        setUserCreatedRooms(userCreatedRooms);
      }
    };
    
    loadRooms();
    
    // 每分钟检查一次过期房间和消息
    const interval = setInterval(loadRooms, 60000);
    return () => clearInterval(interval);
  }, [isGuest, user.id]);

  // 房间过期检查 - 每5分钟检查一次
  useEffect(() => {
    const checkExpiredRooms = () => {
      // 清理过期的官方房间消息
      cleanupExpiredOfficialMessages();
      
      // 为官方房间加载额外消息
      const officialRoomsWithMessages = OFFICIAL_ROOMS.map(room => getOfficialRoomWithMessages(room));
      const userRooms = getAllActiveRooms([]); // 只获取用户房间
      const allRooms = [...officialRoomsWithMessages, ...userRooms];
      
      setRooms(allRooms);
      
      // 如果当前活跃的房间已过期，关闭它
      if (activeChat?.type === 'room') {
        const currentRoom = getRoomById(activeChat.data.id);
        if (!currentRoom && !activeChat.data.isOfficial) {
          setActiveChat(null);
        }
      }
    };
    
    const interval = setInterval(checkExpiredRooms, 300000); // 5分钟
    return () => clearInterval(interval);
  }, [activeChat]);

  useEffect(() => {
    if (!isGuest && user.id) {
        const allUsers = getAllUsers();
        // Refresh current user data, including friends list
        const currentUser = allUsers.find(u => u.id === user.id);
        if (currentUser) {
            setUser(currentUser); // Ensure user state is up-to-date
            if (currentUser.friends) {
                const friendProfiles = allUsers.filter(u => currentUser.friends!.includes(u.id!));
                setFriends(friendProfiles);
            } else {
                setFriends([]);
            }
        }
    }
  }, [user.id, user.friends?.length, isGuest]);

  // Update unread counts
  useEffect(() => {
    if (!isGuest && user.id) {
      // Update unread notifications count
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const unreadCount = notifications.filter((n: any) => n.userId === user.id && !n.isRead).length;
      setUnreadNotifications(unreadCount);

      // Update unread private messages count
      const privateChats = JSON.parse(localStorage.getItem('privateChats') || '[]');
      const unreadPrivateCount = privateChats.reduce((total: number, chat: any) => {
        return total + chat.messages.filter((msg: any) => 
          msg.receiverId === user.id && !msg.isRead
        ).length;
      }, 0);
      setUnreadPrivateMessages(unreadPrivateCount);
    }
  }, [user.id, isGuest]);

  // Effect to simulate incoming messages for unread indicators
  useEffect(() => {
    const messageInterval = setInterval(() => {
      const availableRooms = [...rooms, ...userCreatedRooms];
      const inactiveRooms = availableRooms.filter(r => r.id !== activeChat?.data.id);
      
      if (inactiveRooms.length > 0) {
        const randomRoom = inactiveRooms[Math.floor(Math.random() * inactiveRooms.length)];
        
        const allPossibleUsers = getAllUsers().filter(u => u.id !== user.id && u.id !== randomRoom.host?.id);
        const shouldSimulateUserMessage = Math.random() > 0.5 && allPossibleUsers.length > 0;
        
        let sender: User;

        if (shouldSimulateUserMessage && allPossibleUsers.length > 0) {
            sender = allPossibleUsers[Math.floor(Math.random() * allPossibleUsers.length)];
        } else if (randomRoom.participants.length > 0) {
            sender = randomRoom.participants[Math.floor(Math.random() * randomRoom.participants.length)];
        } else {
            // Skip this iteration if no valid sender
            return;
        }

        const cannedResponses = ["That's an interesting point.", "I was just thinking the same thing!", "Can you elaborate on that?", "Haha, classic!", "Let's change the topic slightly."];
        
        const simulatedMessage: Message = {
          id: `simulated-${Date.now()}`,
          text: cannedResponses[Math.floor(Math.random() * cannedResponses.length)],
          sender: sender,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const updateRoomWithMessage = (roomList: ChatRoom[]) =>
          roomList.map(r => r.id === randomRoom.id ? { ...r, messages: [...r.messages, simulatedMessage] } : r);

        if (randomRoom.isOfficial) {
          setRooms(updateRoomWithMessage);
        } else {
          setUserCreatedRooms(updateRoomWithMessage);
        }

        // Only mark as unread if it's not the currently active chat and it has real participants
        if (activeChat?.data.id !== randomRoom.id) {
          // For both official and user-created rooms, only mark as unread if they have real participants
          // For user-created rooms, only show unread if there are at least 2 participants (host + at least one other)
          const hasRealParticipants = randomRoom.participants.some(p => p.id && p.id !== 'system');
          const hasMultipleParticipants = randomRoom.participants.filter(p => p.id && p.id !== 'system').length >= 2;
          
          if (hasRealParticipants && (randomRoom.isOfficial || hasMultipleParticipants)) {
            setUnreadChats(prev => new Set(prev).add(randomRoom.id));
          }
        }
      }
    }, 20000); // Simulate a message every 20 seconds

    return () => clearInterval(messageInterval);
  }, [activeChat, rooms, userCreatedRooms, user.id]);


  // 保存最后访问的聊天
  useEffect(() => {
    if (activeChat) {
      const chatData = {
        type: activeChat.type,
        id: activeChat.type === 'room' ? activeChat.data.id : activeChat.data.id,
        otherUserId: activeChat.type === 'private' ? activeChat.otherUser.id : null
      };
      localStorage.setItem('lastVisitedChat', JSON.stringify(chatData));
    }
  }, [activeChat]);

  // 恢复最后访问的聊天（不自动选择默认房间）
  useEffect(() => {
    if (!activeChat && rooms.length > 0) {
      // 所有用户都不自动恢复聊天记录，直接显示欢迎界面
      // 这样注册用户和Guest用户都会看到公告页面
      return;
    }
  }, [rooms, activeChat, user.id, isGuest]);

  // 空闲超时检测
  useEffect(() => {
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30分钟

    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastActivity > INACTIVITY_TIMEOUT) {
        // 用户空闲超过30分钟，自动登出
        onLogout();
      }
    };

    // 添加事件监听器
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // 每分钟检查一次空闲状态
    const inactivityInterval = setInterval(checkInactivity, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(inactivityInterval);
    };
  }, [lastActivity, onLogout]);

  const handleLogout = () => {
    onLogout();
  };

  const clearUnreadAndSetLastRead = (chatId: string, messageCount: number) => {
    setUnreadChats(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
    });
    setLastReadMessageCount(prev => new Map(prev).set(chatId, messageCount));
  }


  const handleSelectRoom = (room: ChatRoom) => {
    if (activeChat?.type === 'room' && activeChat.data.id === room.id) return;
    
    // 对于官方房间，直接设置活跃聊天
    if (room.isOfficial) {
      // Clear unread status immediately
      clearUnreadAndSetLastRead(room.id, room.messages.length);
      
      // Set the new active chat immediately to avoid black screen
        setActiveChat({ type: 'room', data: room });
    } else {
      // 对于用户创建的房间，检查是否需要加入
      if (user.id && !isUserInRoom(room.id, user.id)) {
        const success = joinRoom(room.id, user);
        if (!success) {
          // 如果加入失败，可能是被踢出了
          alert('无法加入房间，您可能已被踢出。');
          return;
        }
      }
      
      // 重新加载房间数据以获取最新状态
      const updatedRoom = getRoomById(room.id);
      if (updatedRoom) {
        // Clear unread status immediately
        clearUnreadAndSetLastRead(room.id, updatedRoom.messages.length);
        
        // Set the new active chat immediately to avoid black screen
        setActiveChat({ type: 'room', data: updatedRoom });
      } else {
        // 如果房间服务中没有找到房间（可能是Guest用户），直接使用当前房间
        // Clear unread status immediately
        clearUnreadAndSetLastRead(room.id, room.messages.length);
        
        // Set the new active chat immediately to avoid black screen
        setActiveChat({ type: 'room', data: room });
      }
    }
    
    // Hide sidebar on mobile
        if (window.innerWidth < 768) {
            setIsSidebarVisible(false);
        }
  };
  
  const handleCreateRoom = (name: string, roomType: 'public' | 'private', icon: string) => {
    if (isGuest) return;
    
    // 检查用户是否可以创建房间
    if (user.id) {
      const canCreate = canUserCreateRoom(user.id);
      if (!canCreate.canCreate) {
        alert(canCreate.message);
        return;
      }
    }
    
    const newRoom = createRoom(name, user, roomType, icon);
    setActiveChat({ type: 'room', data: newRoom });
    
    // 重新加载房间列表
    const officialRoomsWithMessages = OFFICIAL_ROOMS.map(room => getOfficialRoomWithMessages(room));
    const userRooms = getAllActiveRooms([]);
    const allRooms = [...officialRoomsWithMessages, ...userRooms];
    setRooms(allRooms);
    
    if (user.id) {
      const userCreatedRooms = getUserCreatedRooms(user.id);
      setUserCreatedRooms(userCreatedRooms);
    }
  };

  const handleAddFriend = (friendId: string) => {
    if (!user.id) return;
    const result = addFriend(user.id, friendId);
    if (result.success && result.user) {
        setUser(result.user); // This will trigger re-render and update friend list
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    if (!user.id) return;
    const result = removeFriend(user.id, friendId);
    if (result.success && result.user) {
        setUser(result.user); // This will trigger re-render and update friend list
    }
  };

  const handleViewProfile = (userToView: User) => {
    setSelectedUser(userToView);
    setUserProfileModalOpen(true);
  };

  const handleInviteUser = (room: ChatRoom) => {
    setSelectedRoomForInvite(room);
    setInviteUserModalOpen(true);
  };

  const handleInviteSuccess = () => {
    // 重新加载房间列表以显示更新的邀请信息
    const officialRoomsWithMessages = OFFICIAL_ROOMS.map(room => getOfficialRoomWithMessages(room));
    const userRooms = getAllActiveRooms([]);
    const allRooms = [...officialRoomsWithMessages, ...userRooms];
    setRooms(allRooms);
  };

  const handleBlockUser = (userId: string) => {
    if (!user.id) return;
    const result = blockUser(user.id, userId);
    if (result.success && result.user) {
      setUser(result.user);
    }
  };

  const handleUnblockUser = (userId: string) => {
    if (!user.id) return;
    const result = unblockUser(user.id, userId);
    if (result.success && result.user) {
      setUser(result.user);
    }
  };
  
  const handleUpdateProfile = (profileData: Partial<UserProfile>) => {
    if (!user.id) return { success: false, message: 'Guests cannot edit profiles.' };
    const result = updateUserProfile(user.id, profileData);
    if (result.success && result.user) {
        setUser(result.user);
    }
    return { success: result.success, message: result.message };
  }

  const handleSelectPrivateChat = (chat: PrivateChat, otherUser: User) => {
    if (activeChat?.type === 'private' && activeChat.data.id === chat.id) return;
    
    setIsLoading(true);
    setActiveChat(null);

    setTimeout(() => {
      setActiveChat({ type: 'private', data: chat, otherUser });
      setIsLoading(false);
      if (window.innerWidth < 768) {
        setIsSidebarVisible(false);
      }
    }, 300);
  };

  const handleOpenInbox = () => {
    setIsInboxOpen(true);
    setIsHistoryOpen(false); // 关闭历史窗口
    if (window.innerWidth < 768) {
      setIsSidebarVisible(false);
    }
  };

  const handleOpenHistory = () => {
    setIsHistoryOpen(true);
    setIsInboxOpen(false); // 关闭收件箱窗口
    if (window.innerWidth < 768) {
      setIsSidebarVisible(false);
    }
  };

  const handleCloseInbox = () => {
    setIsInboxOpen(false);
  };

  const handleCloseHistory = () => {
    setIsHistoryOpen(false);
  };

  const handleSelectChatFromHistory = (chat: import('../types').ChatHistory) => {
    // This would need to be implemented based on the chat type
    // For now, just close the history modal
    setIsHistoryOpen(false);
  };


  const handleSendMessage = async (message: { text?: string; imageUrl?: string }) => {
    if (!activeChat || isLoading) return;

    if (activeChat.type === 'private') {
      // Private chat message handling is done in PrivateChatWindow component
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: user,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...message
    };

     if (activeChat.type === 'room') {
        const room = activeChat.data;
        const updatedMessages = [...room.messages, userMessage];
        const updatedRoom = {...room, messages: updatedMessages };

        // 保存消息到相应的存储
        if (room.isOfficial) {
          addOfficialRoomMessage(room.id, userMessage);
        } else {
          addMessageToRoom(room.id, userMessage);
        }

        setActiveChat({ type: 'room', data: updatedRoom });
         setLastReadMessageCount(prev => new Map(prev).set(room.id, updatedRoom.messages.length));

        // 更新房间列表
        const officialRoomsWithMessages = OFFICIAL_ROOMS.map(room => getOfficialRoomWithMessages(room));
        const userRooms = getAllActiveRooms([]);
        const allRooms = [...officialRoomsWithMessages, ...userRooms];
        setRooms(allRooms);

        // 更新聊天历史
        if (!isGuest && user.id) {
          const { updateChatHistory, createRoomHistory } = await import('../services/chatHistoryService');
          const roomHistory = createRoomHistory(updatedRoom, user.id);
          updateChatHistory(roomHistory);
        }
    }
  };
  
  return (
    <div className="h-screen w-screen flex flex-col bg-primary mobile-optimized">
      {/* Top Navigation */}
      <TopNavigation
        currentUser={user}
        onOpenInbox={handleOpenInbox}
        onOpenHistory={handleOpenHistory}
        onLogout={handleLogout}
        onEditProfile={() => setEditProfileModalOpen(true)}
        isGuest={isGuest}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <aside className={`transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'} absolute md:static z-10 h-full`}>
            <Sidebar
              rooms={allRooms}
              friends={friends}
              onSelectRoom={handleSelectRoom}
                  onSelectPrivateChat={handleSelectPrivateChat}
              activeChatId={activeChat?.data.id}
              currentUser={user}
              onCreateRoom={() => setCreateRoomModalOpen(true)}
              onAddFriend={() => setAddFriendModalOpen(true)}
                  onRemoveFriend={handleRemoveFriend}
                  onViewProfile={handleViewProfile}
                  onInviteUser={handleInviteUser}
              isGuest={isGuest}
              unreadChats={unreadChats}
            />
        </aside>
        <main className="flex-1 flex flex-col bg-primary">
          {isInboxOpen ? (
            <Inbox
              currentUser={user}
              onSelectPrivateChat={handleSelectPrivateChat}
              onClose={handleCloseInbox}
              onBlockUser={handleBlockUser}
              onUnblockUser={handleUnblockUser}
              isGuest={isGuest}
            />
          ) : isHistoryOpen ? (
            <ChatHistory
              currentUser={user}
              onSelectChat={handleSelectChatFromHistory}
              onClose={handleCloseHistory}
            />
          ) : isLoading && !activeChat ? (
            <div className="flex-1 flex items-center justify-center">
                <SpinnerIcon className="w-12 h-12 text-highlight animate-spin" />
            </div>
          ) : activeChat?.type === 'room' ? (
            <ChatWindow
              chatRoom={activeChat.data}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              currentUser={user}
              lastReadCount={lastReadMessageCount.get(activeChat.data.id) ?? 0}
              onAddFriend={handleAddFriend}
              onUserKicked={() => {
                // 用户被踢出后，刷新房间数据
                setRooms(getRooms());
                // 如果被踢的是当前用户，退出房间
                if (activeChat.data.participants.every(p => p.id !== user.id)) {
                  setActiveChat(null);
                }
              }}
            />
          ) : activeChat?.type === 'private' ? (
            <PrivateChatWindow
              chat={activeChat.data}
              currentUser={user}
              otherUser={activeChat.otherUser}
              onSendMessage={handleSendMessage}
              onBlockUser={handleBlockUser}
              onUnblockUser={handleUnblockUser}
              isLoading={isLoading}
              isGuest={isGuest}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-secondary">
              <div className="text-center max-w-md mx-auto p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">Welcome to ChatSphere!</h2>
                <div className="space-y-4 text-left">
                  <div className="bg-highlight/20 p-4 rounded-lg">
                    <p className="font-semibold text-text-primary mb-2">📌 Important Notes:</p>
                    <ul className="space-y-2 text-sm">
                      <li>• Use block button, it will help us to keep the chat clean, Thanks.</li>
                      <li>• Note: You will be automatically disconnected after a long time of inactivity</li>
                      <li>• Well, Enjoy your time!</li>
                    </ul>
                  </div>
                  <p className="text-center text-sm">Select a chat from the left to get started.</p>
                </div>
              </div>
            </div>
          )}
        </main>
        <aside className="hidden lg:block w-64 xl:w-72 bg-secondary p-4 flex-shrink-0 border-l border-accent">
          <AdPlaceholder title="Skyscraper Ad" width="w-full" height="h-full" />
        </aside>
      </div>
      {!isGuest && isCreateRoomModalOpen && (
        <CreateRoomModal 
            onClose={() => setCreateRoomModalOpen(false)}
            onCreate={handleCreateRoom}
        />
      )}
      {!isGuest && isAddFriendModalOpen && (
          <AddFriendModal
            currentUser={user}
            onClose={() => setAddFriendModalOpen(false)}
            onAddFriend={handleAddFriend}
            isGuest={isGuest}
          />
      )}
      {isEditProfileModalOpen && (
        <EditProfileModal
            currentUser={user}
            onClose={() => setEditProfileModalOpen(false)}
            onUpdate={handleUpdateProfile}
            isGuest={isGuest}
        />
      )}
      {isUserProfileModalOpen && selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => {
            setUserProfileModalOpen(false);
            setSelectedUser(null);
          }}
          onBlockUser={handleBlockUser}
          onUnblockUser={handleUnblockUser}
          isBlocked={user.id ? isUserBlocked(user.id, selectedUser.id!) : false}
          isGuest={isGuest}
        />
      )}
      {isInviteUserModalOpen && selectedRoomForInvite && (
        <InviteUserModal
          room={selectedRoomForInvite}
          currentUser={user}
          onClose={() => {
            setInviteUserModalOpen(false);
            setSelectedRoomForInvite(null);
          }}
          onInviteSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
};

export default ChatScreen;