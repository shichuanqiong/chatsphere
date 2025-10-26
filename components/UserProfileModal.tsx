import React from 'react';
import type { User } from '../types';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  isBlocked: boolean;
  isGuest: boolean;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  user, 
  onClose, 
  onBlockUser, 
  onUnblockUser, 
  isBlocked, 
  isGuest 
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-accent">
          <h2 className="text-2xl font-bold text-text-primary">User Profile</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            {user.avatar ? (
              <img src={user.avatar} alt={user.nickname} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white text-2xl">
                {user.nickname.substring(0,2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-text-primary">{user.nickname}</h3>
              <p className="text-text-secondary">{`${user.age} years old, ${user.gender}`}</p>
              <p className="text-text-secondary">{user.country}</p>
            </div>
          </div>
          
          {user.bio && (
            <div className="mb-6">
              <h4 className="font-semibold text-text-primary mb-2">Bio</h4>
              <p className="text-text-secondary italic">"{user.bio}"</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            {!isGuest && user.id && !user.id.startsWith('guest-') && (
              <>
                {isBlocked ? (
                  <button
                    onClick={() => {
                      onUnblockUser(user.id!);
                      onClose();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span>Unblock</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onBlockUser(user.id!);
                      onClose();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                    <span>Block</span>
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-accent text-text-primary rounded-lg hover:bg-accent/70 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
