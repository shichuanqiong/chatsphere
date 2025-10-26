import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, EmojiIcon, GifIcon } from './icons';
import GifModal from './GifModal';
import { detectContentViolations, autoHandleViolation } from '../services/contentModerationService';

interface MessageInputProps {
  onSendMessage: (message: { text?: string; imageUrl?: string }) => void;
  isLoading: boolean;
  currentUser?: { id: string; nickname: string };
  currentRoom?: { id: string; name: string };
  isPrivateChat?: boolean; // 是否为私聊
  onViolationDetected?: (violation: any) => void;
}

const EMOJIS = [
  '😀', '😂', '😍', '🤔', '😎', '😢', '👍', '❤️', '🔥', '🎉', '👋', '💯',
  '😊', '🥳', '😭', '🤯', '😱', '😇', '😴', '😜', '🤞', '🙏', '🙌', '👀',
  '🍕', '🍔', '🍟', '🍓', '🥑', '☕', '🍺', '🚀', '⭐', '🎸', '⚽', '🏀',
  '🐱', '🐶', '🦄', '🤖', '👾', '👻', '👽', '💀', '🤡', '🌞', '🌙', '🌎',
  '💡', '💻', '📱', '💰', '💔', '✅', '❌', '❓', '❗', '▶️'
];


const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  currentUser, 
  currentRoom, 
  isPrivateChat = false,
  onViolationDetected 
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
        setShowGifPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      // 检测内容违规（仅限房间聊天）
      if (currentUser && currentRoom && !isPrivateChat) {
        const violations = detectContentViolations(text, isPrivateChat);
        
        if (violations.length > 0) {
          // 处理违规
          violations.forEach(violation => {
            violation.messageId = `msg-${Date.now()}`;
            violation.userId = currentUser.id;
            violation.roomId = currentRoom.id;
            
            const actionMessage = autoHandleViolation(violation);
            
            // 通知父组件
            if (onViolationDetected) {
              onViolationDetected({
                violation,
                actionMessage,
                user: currentUser,
                room: currentRoom
              });
            }
            
            // 只有在采取了实际行动时才显示警告
            if (violation.actionTaken && violation.actionTaken !== 'none') {
              alert(`⚠️ Content Moderation Warning: ${actionMessage}`);
            }
          });
          
          // 如果有严重违规且采取了行动，阻止发送
          const hasCriticalViolation = violations.some(v => 
            v.severity === 'critical' && v.actionTaken && v.actionTaken !== 'none'
          );
          if (hasCriticalViolation) {
            return;
          }
        }
      }
      
      onSendMessage({ text });
      setText('');
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const imageUrlRegex = /(https?:\/\/\S+\.(?:gif|jpe?g|png|webp))/i;
    const match = value.match(imageUrlRegex);

    if (match) {
      onSendMessage({ imageUrl: match[0] });
      setText('');
    } else {
      setText(value);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
      setText(prev => prev + emoji);
  }

  const handleGifSelect = (url: string) => {
    onSendMessage({ imageUrl: url });
    setShowGifPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowGifPicker(false);
    setShowEmojiPicker(prev => !prev);
  };

  const toggleGifPicker = () => {
    setShowEmojiPicker(false);
    setShowGifPicker(prev => !prev);
  };

  return (
    <div className="flex-shrink-0 p-4 bg-secondary/70 backdrop-blur-sm border-t border-accent/40 relative" ref={containerRef}>
      {showEmojiPicker && (
          <div className="absolute bottom-full left-4 mb-2 bg-accent p-2 rounded-lg grid grid-cols-9 gap-1 shadow-lg z-20 w-80 max-h-60 overflow-y-auto">
              {EMOJIS.map(emoji => (
                  <button key={emoji} onClick={() => handleEmojiSelect(emoji)} className="text-2xl p-1 rounded-md hover:bg-primary/50 transition-transform hover:scale-125">
                      {emoji}
                  </button>
              ))}
          </div>
      )}
      {showGifPicker && <GifModal onSelectGif={handleGifSelect} onClose={() => setShowGifPicker(false)} />}
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <div className="relative flex-1">
            <input
              type="text"
              value={text}
              onChange={handleInputChange}
              placeholder="Type a message or paste an image/GIF URL..."
              className="w-full px-4 py-2 pr-24 bg-accent border border-transparent rounded-full text-text-primary focus:outline-none focus:ring-2 focus:ring-highlight"
              disabled={isLoading}
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                <button
                    type="button"
                    onClick={toggleGifPicker}
                    className="p-2 text-text-secondary hover:text-text-primary"
                    aria-label="Open GIF picker"
                >
                    <GifIcon className="w-6 h-6" />
                </button>
                <button
                    type="button"
                    onClick={toggleEmojiPicker}
                    className="p-2 text-text-secondary hover:text-text-primary"
                    aria-label="Open emoji picker"
                >
                    <EmojiIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="p-3 rounded-full bg-highlight text-white disabled:bg-accent disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Send message"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;