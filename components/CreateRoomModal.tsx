import React, { useState } from 'react';
import IconPicker from './IconPicker';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (name: string, roomType: 'public' | 'private', icon: string) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState<'public' | 'private'>('public');
  const [selectedIcon, setSelectedIcon] = useState('chat');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        setError('Room name is required.');
        return;
    }

    onCreate(name, roomType, selectedIcon);
    onClose();
  }

  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as 'public' | 'private';
    setRoomType(value);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-accent">
            <h2 className="text-2xl font-bold text-text-primary">Create a New Room</h2>
            <p className="text-text-secondary mt-1">Create your own chat room and invite others to join.</p>
          </div>
          <div className="p-6 space-y-6">
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div>
              <label htmlFor="roomName" className="block text-sm font-medium text-text-secondary">Room Name</label>
              <input
                id="roomName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-accent border border-transparent rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-highlight"
                placeholder="e.g., Tech Talk"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">Room Type</label>
              <div className="space-y-3">
                <div 
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-accent/30 transition-colors"
                  onClick={() => {
                    setRoomType('public');
                  }}
                >
                  <input
                    type="radio"
                    name="roomType"
                    value="public"
                    checked={roomType === 'public'}
                    onChange={handleRoomTypeChange}
                    className="w-4 h-4"
                    style={{ accentColor: '#14b8a6' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <div className="text-text-primary font-medium">Public Room</div>
                    <div className="text-text-secondary text-sm">Anyone can join and chat</div>
                  </div>
                </div>
                
                <div 
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-accent/30 transition-colors"
                  onClick={() => {
                    setRoomType('private');
                  }}
                >
                  <input
                    type="radio"
                    name="roomType"
                    value="private"
                    checked={roomType === 'private'}
                    onChange={handleRoomTypeChange}
                    className="w-4 h-4"
                    style={{ accentColor: '#14b8a6' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <div className="text-text-primary font-medium">Private Room</div>
                    <div className="text-text-secondary text-sm">Only invited users can join</div>
                  </div>
                </div>
              </div>
            </div>
            
            <IconPicker 
              selectedIcon={selectedIcon}
              onIconSelect={setSelectedIcon}
            />
          </div>
          <div className="px-6 py-4 bg-accent/50 flex justify-end items-center space-x-3 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-text-primary bg-accent hover:bg-accent/70 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-highlight hover:bg-teal-500 transition-colors">
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
