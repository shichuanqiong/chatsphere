import React, { useRef, useEffect, useState } from 'react';
import type { ChatRoom, Message, User } from '../types';
import MessageInput from './MessageInput';
import AdPlaceholder from './AdPlaceholder';
import ChatBackground from './ChatBackground';
import KickUserModal from './KickUserModal';
import { UsersIcon, UserPlusIcon } from './icons';
import { kickUserFromRoom } from '../services/roomService';

interface ChatWindowProps {
  chatRoom: ChatRoom;
  onSendMessage: (message: { text?: string; imageUrl?: string }) => void;
  isLoading: boolean;
  currentUser: User;
  lastReadCount: number;
  onAddFriend: (friendId: string) => void;
  onUserKicked?: () => void; // 用户被踢出后的回调
}

interface MessageBubbleProps {
  message: Message;
  currentUser: User;
  isNew: boolean;
  onAddFriend: (friendId: string) => void;
}

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUser, isNew, onAddFriend }) => {
  const [justAdded, setJustAdded] = useState(false);
  const sender = message.sender;
  const isUserMessage = !sender.id || sender.id === (currentUser.id || 'guest');
  const isSystemMessage = sender.id === 'system';
  
  const handleAddFriendClick = () => {
    if ('id' in sender && sender.id && sender.id !== 'system') {
        onAddFriend(sender.id);
        setJustAdded(true);
    }
  };

  const renderAvatar = () => {
    // System message - show system icon
    if (isSystemMessage) {
      return (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      );
    }
    
    // Regular user message
    const isFriend = 'id' in sender && sender.id ? currentUser.friends?.includes(sender.id) : false;
    const canAddFriend = !isSystemMessage && !isFriend && !justAdded && sender.id && sender.id !== 'system';
    
    return (
        <div className="relative group flex-shrink-0">
             <img src={sender.avatar || 'https://i.pravatar.cc/150'} alt={sender.nickname} className="w-8 h-8 rounded-full self-start object-cover" />
             {canAddFriend && (
                 <button 
                    onClick={handleAddFriendClick}
                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title={`Add ${sender.nickname}`}
                 >
                     <UserPlusIcon className="w-4 h-4 text-white"/>
                 </button>
             )}
        </div>
    )
  }


  return (
    <div className={`flex items-end gap-2 ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
      {!isUserMessage ? renderAvatar() : null}
      <div className={`flex flex-col max-w-xs md:max-w-md lg:max-w-lg ${isUserMessage ? 'items-end' : 'items-start'}`}>
         {!isUserMessage && (
             <p className="text-xs text-text-secondary mb-1 ml-3">{sender.nickname}</p>
         )}
                 <div className={`rounded-2xl backdrop-blur-sm ${isUserMessage ? 'bg-highlight/80 text-white rounded-br-none shadow-lg' : 'bg-accent/80 text-text-primary rounded-bl-none shadow-lg'} ${isNew ? 'new-message-highlight' : ''} ${message.imageUrl ? 'p-1' : 'px-4 py-3'}`}>
            {message.text && <p className="text-sm break-words">{message.text}</p>}
            {message.imageUrl && (
              <img src={message.imageUrl} alt="gif content" className="max-w-full rounded-xl" style={{ maxHeight: '200px' }} />
            )}
            <p className={`text-xs mt-1 ${isUserMessage ? 'text-gray-200' : 'text-text-secondary'} text-right`}>{message.timestamp}</p>
        </div>
      </div>
       {isUserMessage && (sender.avatar ?
            <img src={sender.avatar} alt={sender.nickname} className="w-8 h-8 rounded-full self-start object-cover" /> :
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white self-start">
               {getInitials(sender.nickname)}
           </div>
       )}
    </div>
  );
};

const ChatWindow: React.FC<ChatWindowProps> = ({ chatRoom, onSendMessage, isLoading, currentUser, lastReadCount, onAddFriend, onUserKicked }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [justAddedHost, setJustAddedHost] = useState(false);
  
  // 踢人相关状态
  const [kickModalOpen, setKickModalOpen] = useState(false);
  const [userToKick, setUserToKick] = useState<User | null>(null);

  useEffect(() => {
    setJustAddedHost(false);
  }, [chatRoom.id]);
  
  // 踢人功能
  const handleKickUser = (user: User) => {
    setUserToKick(user);
    setKickModalOpen(true);
  };
  
  const confirmKickUser = () => {
    if (userToKick && chatRoom.hostId === currentUser.id) {
      const success = kickUserFromRoom(chatRoom.id, userToKick.id, currentUser.id);
      if (success) {
        // 添加踢人消息
        const kickMessage = {
          id: `kick-${Date.now()}`,
          text: `${userToKick.nickname} was kicked from the room by ${currentUser.nickname}`,
          sender: currentUser,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        chatRoom.messages.push(kickMessage);
        
        // 通知父组件更新
        if (onUserKicked) {
          onUserKicked();
        }
      }
    }
    setKickModalOpen(false);
    setUserToKick(null);
  };
  
  const cancelKickUser = () => {
    setKickModalOpen(false);
    setUserToKick(null);
  };
  
  // 检查当前用户是否是房主
  const isHost = chatRoom.hostId === currentUser.id;

  useEffect(() => {
    // Scroll to bottom, but only if the user is already near the bottom
    const container = chatContainerRef.current;
    if (container) {
      const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 100;
      if (isScrolledToBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [chatRoom.messages]);

  const handleAddHostAsFriend = () => {
    if (chatRoom.host?.id) {
        onAddFriend(chatRoom.host.id);
        setJustAddedHost(true);
    }
  };
    
  const host = chatRoom.host;
  const isGuest = !currentUser.id;
  const isHostSelf = host?.id === currentUser.id;
  const isHostFriend = host?.id ? currentUser.friends?.includes(host.id) : false;
  const canAddHostAsFriend = !isGuest && host && !isHostSelf && !isHostFriend && !justAddedHost;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* 轮转背景 */}
        <ChatBackground />
        
        {/* 内容层 */}
        <div className="relative z-10 flex-1 flex flex-col h-full">
        <header className="hidden md:flex flex-shrink-0 items-center justify-between p-4 bg-secondary/60 backdrop-blur-sm border-b border-accent/30">
            <div className="flex items-center space-x-4">
                {(() => {
                    if (chatRoom.isOfficial) {
                        return <UsersIcon className="w-10 h-10 text-text-secondary" />;
                    }
                    if (!chatRoom.isOfficial && chatRoom.participants.length === 1) { // Bot DM
                        return <img src={chatRoom.participants[0].avatar} alt={chatRoom.participants[0].name} className="w-10 h-10 rounded-full object-cover" />;
                    }
                    if (host) { // User created room
                        if (host.avatar) {
                            return <img src={host.avatar} alt={host.nickname} className="w-10 h-10 rounded-full object-cover" />;
                        }
                        return (
                            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                                {getInitials(host.nickname)}
                            </div>
                        );
                    }
                    return <UsersIcon className="w-10 h-10 text-text-secondary" />; // Fallback
                })()}

                <div>
                    <h2 className="text-lg font-bold text-text-primary">{chatRoom.name}</h2>
                    
                    {chatRoom.isOfficial ? (
                        <p className="text-sm text-text-secondary">
                            Official Room
                        </p>
                    ) : host ? (
                        <p className="text-sm text-text-secondary flex items-center space-x-2">
                            <span>Hosted by {host.nickname}</span>
                            {canAddHostAsFriend && (
                                <button 
                                    onClick={handleAddHostAsFriend}
                                    className="px-2 py-0.5 text-xs rounded-full transition-colors flex items-center space-x-1 bg-highlight text-white hover:bg-teal-500"
                                    title={`Add ${host.nickname} as a friend`}
                                >
                                    <UserPlusIcon className="w-3 h-3"/>
                                    <span>Add Friend</span>
                                </button>
                            )}
                            {justAddedHost && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-accent text-text-primary">
                                    Added!
                                </span>
                            )}
                        </p>
                    ) : (
                        <div className="text-sm text-text-secondary">
                            <div className="mb-2 space-y-1">
                                {chatRoom.participants.map((participant, index) => (
                                    <div key={participant.id || index} className="flex items-center justify-between group">
                                        <span>{participant.name}</span>
                                        {isHost && participant.id !== currentUser.id && (
                                            <button
                                                onClick={() => handleKickUser(participant)}
                                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity ml-2"
                                                title={`踢出 ${participant.name}`}
                                            >
                                                ❌
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {isHost && chatRoom.participants.length > 1 && (
                                <div className="text-xs text-gray-500">
                                    悬停在用户名上显示踢出按钮
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
      
      <div className="p-2 lg:hidden">
        <AdPlaceholder title="Mobile Banner Ad" width="w-full" height="h-16" />
      </div>

      <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto bg-black/10 backdrop-blur-sm">
        {chatRoom.messages.map((msg, index) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            currentUser={currentUser} 
            isNew={index >= lastReadCount}
            onAddFriend={onAddFriend}
          />
        ))}
        {isLoading && (
            <div className="flex items-end gap-2 justify-start">
                 <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-accent text-text-primary rounded-bl-none">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-text-secondary">Typing</span>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                    </div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput 
        onSendMessage={onSendMessage} 
        isLoading={isLoading}
        currentUser={currentUser}
        currentRoom={chatRoom}
        isPrivateChat={false} // 房间聊天启用检测
        onViolationDetected={(violationData) => {
          // 不再在房间中显示系统消息，只记录违规
          console.log('Content violation detected:', violationData);
        }}
      />
        </div>
        
        {/* 踢人确认模态框 */}
        <KickUserModal
          isOpen={kickModalOpen}
          onClose={cancelKickUser}
          onConfirm={confirmKickUser}
          user={userToKick}
          roomName={chatRoom.name}
        />
    </div>
  );
};

export default ChatWindow;