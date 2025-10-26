import React, { useState } from 'react';
import type { User, UserProfile } from '../types';

interface EditProfileModalProps {
  currentUser: User;
  onClose: () => void;
  onUpdate: (profileData: Partial<UserProfile>) => { success: boolean; message?: string };
  isGuest?: boolean;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ currentUser, onClose, onUpdate, isGuest = false }) => {
  const [nickname, setNickname] = useState(currentUser.nickname);
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Nickname cannot be empty.');
      return;
    }

    const result = onUpdate({
      nickname,
      avatar,
      bio,
    });

    if (result.success) {
      onClose();
    } else {
      setError(result.message || 'An unknown error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-accent">
            <h2 className="text-2xl font-bold text-text-primary">Edit Your Profile</h2>
            <p className="text-text-secondary mt-1">Update your personal information.</p>
          </div>
          <div className="p-6 space-y-6">
            {error && <p className="text-red-400 text-sm text-center bg-red-900/30 p-2 rounded-md">{error}</p>}
            
            <div>
              <label htmlFor="editNickname" className="block text-sm font-medium text-text-secondary">Nickname</label>
              <input
                id="editNickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-accent border border-transparent rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            
            <div>
              <label htmlFor="editAvatar" className="block text-sm font-medium text-text-secondary">
                Avatar URL {isGuest && <span className="text-red-400 text-xs">(Not editable for guests)</span>}
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <img src={avatar} alt="Avatar preview" className="w-10 h-10 rounded-full bg-accent object-cover flex-shrink-0" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'} />
                <input
                  id="editAvatar"
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className={`block w-full px-3 py-2 bg-accent border border-transparent rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-highlight ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="https://example.com/avatar.png"
                  disabled={isGuest}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="editBio" className="block text-sm font-medium text-text-secondary">Bio</label>
              <textarea
                id="editBio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-accent border border-transparent rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-highlight"
                placeholder="Tell us a little about yourself..."
                rows={3}
                maxLength={100}
              />
            </div>
          </div>
          
          <div className="px-6 py-4 bg-accent/50 flex justify-end items-center space-x-3 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-text-primary bg-accent hover:bg-accent/70 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-highlight hover:bg-teal-500 transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;