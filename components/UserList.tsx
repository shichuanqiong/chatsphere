
import React from 'react';
import type { User, UserProfile } from '../types';
import { LogoutIcon } from './icons';

interface UserListProps {
  users: User[];
  onSelectUser: (user: User) => void;
  activeUserId?: string | null;
  currentUserProfile: UserProfile;
  onLogout: () => void;
}

const UserList: React.FC<UserListProps> = ({ users, onSelectUser, activeUserId, currentUserProfile, onLogout }) => {
  return (
    <div className="w-64 md:w-72 h-full bg-secondary flex flex-col border-r border-accent">
      <div className="p-4 border-b border-accent">
        <h2 className="text-xl font-bold text-text-primary">Online Users</h2>
        <p className="text-sm text-text-secondary">({users.length} available)</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul>
          {users.map(user => (
            <li key={user.id}>
              <button
                onClick={() => onSelectUser(user)}
                className={`w-full text-left p-4 flex items-center space-x-3 transition-colors duration-200 ${
                  activeUserId === user.id ? 'bg-highlight/20' : 'hover:bg-accent/50'
                }`}
              >
                <div className="relative">
                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-secondary"></span>
                </div>
                <div>
                  <h3 className={`font-semibold ${activeUserId === user.id ? 'text-highlight' : 'text-text-primary'}`}>{user.name}</h3>
                  <p className="text-sm text-text-secondary">{`${user.age}, ${user.gender}, ${user.country}`}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
       <div className="p-4 border-t border-accent flex items-center justify-between bg-accent">
        <div>
            <p className="font-semibold text-text-primary">{currentUserProfile.nickname}</p>
            <p className="text-xs text-text-secondary">{`${currentUserProfile.age}, ${currentUserProfile.gender}`}</p>
        </div>
        <button onClick={onLogout} title="Logout" className="p-2 text-text-secondary hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-secondary">
          <LogoutIcon className="w-6 h-6"/>
        </button>
      </div>
    </div>
  );
};

export default UserList;