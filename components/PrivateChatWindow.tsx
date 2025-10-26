import React, { useState, useEffect, useRef } from 'react';
import type { User, PrivateChat, PrivateMessage } from '../types';
import { addPrivateMessage, markPrivateChatAsRead } from '../services/chatHistoryService';
import { createMessageNotification } from '../services/notificationService';
import MessageInput from './MessageInput';
import { SendIcon, SpinnerIcon, BlockIcon, UnblockIcon } from './icons';
import { isUserBlocked } from '../services/authService';

interface PrivateChatWindowProps {
  chat: PrivateChat;
  currentUser: User;
  otherUser: User;
  onSendMessage: (message: { text?: string; imageUrl?: string }) => void;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  isLoading?: boolean;
  isGuest?: boolean;
}

const PrivateChatWindow: React.FC<PrivateChatWindowProps> = ({
  chat,
  currentUser,
  otherUser,
  onSendMessage,
  onBlockUser,
  onUnblockUser,
  isLoading = false,
  isGuest = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>(chat.messages);

  useEffect(() => {
    setMessages(chat.messages);
    // 标记为已读
    markPrivateChatAsRead(chat.id, currentUser.id!);
  }, [chat.messages, chat.id, currentUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message: { text?: string; imageUrl?: string }) => {
    if (!message.text?.trim() && !message.imageUrl) return;

    const newMessage: PrivateMessage = {
      id: `private-msg-${Date.now()}`,
      text: message.text,
      imageUrl: message.imageUrl,
      senderId: currentUser.id!,
      receiverId: otherUser.id!,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // 添加到本地状态
    setMessages(prev => [...prev, newMessage]);

    // 保存到存储
    addPrivateMessage(chat.id, {
      text: message.text,
      imageUrl: message.imageUrl,
      senderId: currentUser.id!,
      receiverId: otherUser.id!,
    });

    // 创建通知
    createMessageNotification(
      currentUser.id!,
      otherUser.id!,
      currentUser.nickname,
      message.text || '📷 Image'
    );

    // 调用父组件的发送消息处理
    onSendMessage(message);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentUser = (senderId: string) => senderId === currentUser.id;

  return (
    <div className="flex flex-col h-full bg-primary">
      {/* Header */}
      <div className="flex-shrink-0 bg-secondary border-b border-accent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {otherUser.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.nickname}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white">
                  {otherUser.nickname.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-secondary"></span>
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">{otherUser.nickname}</h2>
              <p className="text-sm text-text-secondary">{`${otherUser.age}, ${otherUser.gender} • ${otherUser.country}`}</p>
            </div>
          </div>
          {otherUser.id && !otherUser.id.startsWith('guest-') && (
            <button
              onClick={() => {
                const isBlocked = currentUser.id ? isUserBlocked(currentUser.id, otherUser.id!) : false;
                if (isBlocked) {
                  onUnblockUser(otherUser.id!);
                } else {
                  onBlockUser(otherUser.id!);
                }
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
              style={{
                backgroundColor: currentUser.id && isUserBlocked(currentUser.id, otherUser.id!) ? '#10b981' : '#ef4444',
                color: 'white'
              }}
              title={currentUser.id && isUserBlocked(currentUser.id, otherUser.id!) ? `Unblock ${otherUser.nickname}` : `Block ${otherUser.nickname}`}
            >
              {currentUser.id && isUserBlocked(currentUser.id, otherUser.id!) ? (
                <UnblockIcon className="w-4 h-4" />
              ) : (
                <BlockIcon className="w-4 h-4" />
              )}
              <span>
                {currentUser.id && isUserBlocked(currentUser.id, otherUser.id!) ? 'Unblock' : 'Block'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-text-secondary">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">Send a message to {otherUser.nickname}</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isCurrentUser(message.senderId) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isCurrentUser(message.senderId)
                    ? 'bg-highlight text-white'
                    : 'bg-accent text-text-primary'
                }`}
              >
                {message.imageUrl ? (
                  <img
                    src={message.imageUrl}
                    alt="Shared image"
                    className="max-w-full h-auto rounded"
                  />
                ) : (
                  <p className="text-sm">{message.text}</p>
                )}
                <p
                  className={`text-xs mt-1 ${
                    isCurrentUser(message.senderId)
                      ? 'text-white/70'
                      : 'text-text-secondary'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-accent text-text-primary px-4 py-2 rounded-lg flex items-center gap-2">
              <SpinnerIcon className="w-4 h-4 animate-spin" />
              <span className="text-sm">Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 border-t border-accent p-4">
        <MessageInput 
          onSendMessage={handleSendMessage} 
          isLoading={false}
          currentUser={currentUser}
          currentRoom={undefined}
          isPrivateChat={true} // 私聊不启用检测
        />
      </div>
    </div>
  );
};

export default PrivateChatWindow;
