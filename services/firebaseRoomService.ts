import type { ChatRoom, User } from '../types';
import { db, auth } from './firebase';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';

const ROOMS_COLLECTION = 'rooms';
const OFFICIAL_ROOMS_MESSAGES_COLLECTION = 'official_rooms_messages';

// Firebase房间服务
export const firebaseRoomService = {
  // 获取所有房间
  getAllRooms: async (): Promise<ChatRoom[]> => {
    try {
      const roomsRef = collection(db, ROOMS_COLLECTION);
      const snapshot = await getDocs(roomsRef);
      return snapshot.docs.map(doc => doc.data() as ChatRoom);
    } catch (error) {
      console.error('Error getting rooms:', error);
      return [];
    }
  },

  // 保存房间
  saveRoom: async (room: ChatRoom): Promise<void> => {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, room.id);
      await setDoc(roomRef, room);
    } catch (error) {
      console.error('Error saving room:', error);
    }
  },

  // 创建新房间
  createRoom: async (room: ChatRoom): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, ROOMS_COLLECTION), {
        ...room,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  // 更新房间
  updateRoom: async (roomId: string, updates: Partial<ChatRoom>): Promise<void> => {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      await updateDoc(roomRef, updates);
    } catch (error) {
      console.error('Error updating room:', error);
    }
  },

  // 删除房间
  deleteRoom: async (roomId: string): Promise<void> => {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      await deleteDoc(roomRef);
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  },

  // 监听房间变化（实时更新）
  subscribeToRooms: (callback: (rooms: ChatRoom[]) => void): (() => void) => {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const unsubscribe = onSnapshot(roomsRef, (snapshot) => {
      const rooms = snapshot.docs.map(doc => doc.data() as ChatRoom);
      callback(rooms);
    });
    return unsubscribe;
  },

  // 获取房间
  getRoom: async (roomId: string): Promise<ChatRoom | null> => {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      const snapshot = await getDoc(roomRef);
      if (snapshot.exists()) {
        return snapshot.data() as ChatRoom;
      }
      return null;
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }
};

// 同时保留localStorage作为fallback
export default firebaseRoomService;
