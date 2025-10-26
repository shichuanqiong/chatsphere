import React, { useState, useEffect } from 'react';
import { getAllRoomsForAdmin, deleteRoom } from '../../services/adminDataService';
import { ChatRoom } from '../../types';
import { logInfo, logWarning } from '../../services/logService';

const RoomMonitoring: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'expired' | 'public' | 'private'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, filterType]);

  const loadRooms = () => {
    setIsLoading(true);
    try {
      const allRooms = getAllRoomsForAdmin();
      setRooms(allRooms);
      // 使用新加载的数据立即过滤
      filterRooms(allRooms);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      setIsLoading(false);
    }
  };

  const filterRooms = (roomList = rooms) => {
    let filtered = roomList;

    // Filter by type
    switch (filterType) {
      case 'active':
        filtered = filtered.filter(room => !isRoomExpired(room));
        break;
      case 'expired':
        filtered = filtered.filter(room => isRoomExpired(room));
        break;
      case 'public':
        filtered = filtered.filter(room => room.roomType === 'public');
        break;
      case 'private':
        filtered = filtered.filter(room => room.roomType === 'private');
        break;
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(term) ||
        room.hostId?.toLowerCase().includes(term)
      );
    }

    setFilteredRooms(filtered);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    try {
      const success = deleteRoom(roomId);
      if (success) {
        setRooms(prev => prev.filter(room => room.id !== roomId));
        logWarning('Room deleted by admin', 'room_monitoring', { roomId });
        alert('Room deleted successfully');
      } else {
        alert('Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('An error occurred while deleting the room');
    }
  };

  const isRoomExpired = (room: ChatRoom): boolean => {
    if (!room.createdAt || room.isOfficial) return false;
    
    const createdAt = new Date(room.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff >= 6; // 6小时过期
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getRoomStatus = (room: ChatRoom) => {
    if (room.isOfficial) return { text: 'Official', color: 'bg-purple-100 text-purple-800' };
    if (isRoomExpired(room)) return { text: 'Expired', color: 'bg-red-100 text-red-800' };
    return { text: 'Active', color: 'bg-green-100 text-green-800' };
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Room Monitoring</h2>
        <button
          onClick={loadRooms}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Rooms</h3>
          <div className="text-3xl font-bold text-blue-600">{rooms.length}</div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Rooms</h3>
          <div className="text-3xl font-bold text-green-600">
            {rooms.filter(room => !isRoomExpired(room)).length}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Public Rooms</h3>
          <div className="text-3xl font-bold text-purple-600">
            {rooms.filter(room => room.roomType === 'public').length}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Private Rooms</h3>
          <div className="text-3xl font-bold text-orange-600">
            {rooms.filter(room => room.roomType === 'private').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search rooms by name or host..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="all">All Rooms</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRooms.map((room) => {
                const status = getRoomStatus(room);
                return (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {room.icon ? (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                              {room.icon}
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">#</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{room.name}</div>
                          <div className="text-sm text-gray-500">ID: {room.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.isOfficial ? 'Official' : (room.roomType || 'Public')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.participants.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.messages.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(room.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!room.isOfficial && (
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No rooms found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomMonitoring;
