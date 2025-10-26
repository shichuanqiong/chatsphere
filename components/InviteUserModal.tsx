import React, { useState, useEffect } from 'react';
import type { User, ChatRoom } from '../types';
import { getAllUsers } from '../services/authService';
import { inviteUserToRoom } from '../services/roomService';

interface InviteUserModalProps {
  room: ChatRoom;
  currentUser: User;
  onClose: () => void;
  onInviteSuccess: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ room, currentUser, onClose, onInviteSuccess }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [invitedUsers, setInvitedUsers] = useState<string[]>(room.invitedUsers || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const allUsers = getAllUsers();
    // 过滤掉当前用户和已经在房间中的用户
    const availableUsers = allUsers.filter(user => 
      user.id !== currentUser.id && 
      !room.participants.some(p => p.id === user.id) &&
      !invitedUsers.includes(user.id!)
    );
    setUsers(availableUsers);
  }, [currentUser.id, room.participants, invitedUsers]);

  const filteredUsers = users.filter(user =>
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInviteUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const success = inviteUserToRoom(room.id, userId);
      if (success) {
        setInvitedUsers(prev => [...prev, userId]);
        onInviteSuccess();
      }
    } catch (error) {
      console.error('Failed to invite user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveInvite = (userId: string) => {
    // 这里可以添加移除邀请的逻辑
    setInvitedUsers(prev => prev.filter(id => id !== userId));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-accent">
          <h2 className="text-2xl font-bold text-text-primary">Invite Users to "{room.name}"</h2>
          <p className="text-text-secondary mt-1">Choose users to invite to this private room.</p>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Search input */}
          <div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-accent border border-transparent rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-highlight"
            />
          </div>

          {/* Already invited users */}
          {invitedUsers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-2">Invited Users</h3>
              <div className="space-y-2">
                {invitedUsers.map(userId => {
                  const user = users.find(u => u.id === userId) || room.participants.find(p => p.id === userId);
                  if (!user) return null;
                  
                  return (
                    <div key={userId} className="flex items-center justify-between p-2 bg-accent rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-highlight flex items-center justify-center text-white text-sm font-bold">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.nickname} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            user.nickname.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="text-text-primary font-medium">{user.nickname}</div>
                          <div className="text-text-secondary text-sm">{user.age} • {user.gender}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveInvite(userId)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        disabled={isLoading}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available users */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Available Users</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredUsers.length === 0 ? (
                <p className="text-text-secondary text-center py-4">No users available to invite.</p>
              ) : (
                filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-accent rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-highlight flex items-center justify-center text-white text-sm font-bold">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.nickname} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          user.nickname.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="text-text-primary font-medium">{user.nickname}</div>
                        <div className="text-text-secondary text-sm">{user.age} • {user.gender}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInviteUser(user.id!)}
                      className="px-3 py-1 bg-highlight text-white text-sm rounded-md hover:bg-teal-500 transition-colors"
                      disabled={isLoading}
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-accent/50 flex justify-end items-center space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-text-primary bg-accent hover:bg-accent/70 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;
