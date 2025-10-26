import React from 'react';
import type { User } from '../types';

interface KickUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
  roomName: string;
}

const KickUserModal: React.FC<KickUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  roomName
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">踢出用户</h3>
            <p className="text-sm text-gray-600">此操作不可撤销</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            确定要踢出用户 <span className="font-semibold text-gray-900">{user.nickname}</span> 吗？
          </p>
          <p className="text-sm text-gray-600">
            被踢出的用户将无法再次进入房间 <span className="font-medium">"{roomName}"</span>
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            确认踢出
          </button>
        </div>
      </div>
    </div>
  );
};

export default KickUserModal;
