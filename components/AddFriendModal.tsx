import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { getAllUsers } from '../services/authService';
import { UserPlusIcon } from './icons';

interface AddFriendModalProps {
  currentUser: User;
  onClose: () => void;
  onAddFriend: (friendId: string) => void;
  isGuest: boolean;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ currentUser, onClose, onAddFriend, isGuest }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addedFriends, setAddedFriends] = useState<string[]>([]);

  useEffect(() => {
    // Exclude current user and users who are already friends
    const potentialFriends = getAllUsers().filter(
      user => user.id !== currentUser.id && !currentUser.friends?.includes(user.id!)
    );
    setAllUsers(potentialFriends);
  }, [currentUser]);

  const handleAddFriend = (friendId: string) => {
    onAddFriend(friendId);
    setAddedFriends(prev => [...prev, friendId]);
  };

  const filteredUsers = allUsers.filter(user =>
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-lg flex flex-col" style={{height: '80vh', maxHeight: '600px'}} onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-accent">
          <h2 className="text-2xl font-bold text-text-primary">Find Friends</h2>
          <p className="text-text-secondary mt-1">Discover and add other users on ChatSphere.</p>
        </div>
        <div className="p-6">
             <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-3 py-2 bg-accent border border-transparent rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-highlight"
                placeholder="Search by nickname..."
              />
        </div>
        <div className="flex-1 px-6 pb-6 overflow-y-auto">
            {filteredUsers.length > 0 ? (
                <ul className="space-y-4">
                    {filteredUsers.map(user => {
                        const isAdded = addedFriends.includes(user.id!);
                        return (
                           <li key={user.id} className="p-3 bg-accent/50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.nickname} className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                                                {user.nickname.substring(0,2).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-text-primary">{user.nickname}</p>
                                            <p className="text-xs text-text-secondary">{`${user.age}, ${user.country}`}</p>
                                        </div>
                                    </div>
                                     {!isGuest && (
                                        <button
                                            onClick={() => handleAddFriend(user.id!)}
                                            disabled={isAdded}
                                            className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center space-x-1 flex-shrink-0 ${isAdded ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-highlight text-white hover:bg-teal-500'}`}
                                        >
                                            <UserPlusIcon className="w-4 h-4" />
                                            <span>{isAdded ? 'Added' : 'Add'}</span>
                                        </button>
                                     )}
                                </div>
                                {user.bio && <p className="text-sm text-text-secondary italic mt-2 pl-1">"{user.bio}"</p>}
                           </li>
                        )
                    })}
                </ul>
            ) : (
                <p className="text-center text-text-secondary pt-8">No users found.</p>
            )}
        </div>
        <div className="px-6 py-4 bg-accent/50 flex justify-end items-center space-x-3 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-text-primary bg-accent hover:bg-accent/70 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;