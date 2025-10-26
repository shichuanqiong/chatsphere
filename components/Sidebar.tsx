import React, { useState } from 'react';
import type { User, ChatRoom, PrivateChat } from '../types';
import { PlusIcon, UsersIcon, VerifiedIcon, UserPlusIcon, XIcon, ChevronDownIcon, ChevronRightIcon } from './icons';

// 房间图标映射
const ROOM_ICONS: { [key: string]: string } = {
  chat: '💬',
  heart: '❤️',
  star: '⭐',
  fire: '🔥',
  rocket: '🚀',
  crown: '👑',
  diamond: '💎',
  lightning: '⚡',
  sun: '☀️',
  moon: '🌙',
  coffee: '☕',
  pizza: '🍕',
  game: '🎮',
  music: '🎵',
  camera: '📷',
  book: '📚',
  paint: '🎨',
  football: '⚽',
  basketball: '🏀',
  car: '🚗',
  plane: '✈️',
  house: '🏠',
  tree: '🌳',
  flower: '🌸',
  cat: '🐱',
  dog: '🐶',
  fish: '🐠',
  butterfly: '🦋',
  rainbow: '🌈',
  gift: '🎁',
  // 新增30个图标
  smile: '😊',
  laugh: '😂',
  love: '🥰',
  wink: '😉',
  cool: '😎',
  thinking: '🤔',
  party: '🎉',
  balloon: '🎈',
  cake: '🎂',
  icecream: '🍦',
  hamburger: '🍔',
  taco: '🌮',
  sushi: '🍣',
  beer: '🍺',
  wine: '🍷',
  popcorn: '🍿',
  donut: '🍩',
  cookie: '🍪',
  lollipop: '🍭',
  chocolate: '🍫',
  trophy: '🏆',
  medal: '🏅',
  ticket: '🎫',
  dice: '🎲',
  chess: '♟️',
  puzzle: '🧩',
  magic: '🪄',
  crystal: '🔮',
  key: '🗝️',
  lock: '🔒',
  unlock: '🔓',
  bell: '🔔',
  alarm: '⏰',
  stopwatch: '⏱️',
  hourglass: '⏳',
  compass: '🧭',
  globe: '🌍',
  map: '🗺️',
  mountain: '⛰️',
  volcano: '🌋',
  island: '🏝️',
  desert: '🏜️',
  snowflake: '❄️',
  cloud: '☁️',
  umbrella: '☂️',
  zap: '⚡',
  snowman: '⛄',
  comet: '☄️',
  telescope: '🔭',
  microscope: '🔬',
  gear: '⚙️',
  hammer: '🔨',
  wrench: '🔧',
  nut: '🔩',
  link: '🔗',
  chain: '⛓️',
  anchor: '⚓',
  sailboat: '⛵',
  ship: '🚢',
  ferris: '🎡',
  roller: '🎢',
  circus: '🎪',
  tent: '⛺',
  camping: '🏕️',
  hotel: '🏨',
  hospital: '🏥',
  school: '🏫',
  office: '🏢',
  bank: '🏦',
  church: '⛪',
  mosque: '🕌',
  synagogue: '🕍',
  temple: '🛕',
  castle: '🏰',
  bridge: '🌉',
  fountain: '⛲',
  statue: '🗽',
  tower: '🗼',
  factory: '🏭',
  construction: '🏗️',
  crane: '🏗️',
  bulldozer: '🚜',
  tractor: '🚜',
  motorcycle: '🏍️',
  bike: '🚲',
  scooter: '🛴',
  skateboard: '🛹',
  bus: '🚌',
  truck: '🚚',
  van: '🚐',
  taxi: '🚕',
  police: '🚔',
  ambulance: '🚑',
  firetruck: '🚒',
  train: '🚆',
  metro: '🚇',
  tram: '🚊',
  monorail: '🚝',
  mountain_railway: '🚞',
  steam_locomotive: '🚂',
  railway_car: '🚃',
  bullettrain: '🚅',
  helicopter: '🚁',
  suspension_railway: '🚟',
  mountain_cableway: '🚠',
  aerial_tramway: '🚡',
  satellite: '🛰️',
  rocket2: '🚀',
  flying_saucer: '🛸',
  bellhop: '🛎️',
  luggage: '🧳',
  hourglass_flowing: '⏳',
  watch: '⌚',
  alarm_clock: '⏰',
  stopwatch2: '⏱️',
  timer: '⏲️',
  mantelpiece_clock: '🕰️',
  twelve_oclock: '🕛',
  twelve_thirty: '🕧',
  one_oclock: '🕐',
  one_thirty: '🕜',
  two_oclock: '🕑',
  two_thirty: '🕝',
  three_oclock: '🕒',
  three_thirty: '🕞',
  four_oclock: '🕓',
  four_thirty: '🕟',
  five_oclock: '🕔',
  five_thirty: '🕠',
  six_oclock: '🕕',
  six_thirty: '🕡',
  seven_oclock: '🕖',
  seven_thirty: '🕢',
  eight_oclock: '🕗',
  eight_thirty: '🕣',
  nine_oclock: '🕘',
  nine_thirty: '🕤',
  ten_oclock: '🕙',
  ten_thirty: '🕥',
  eleven_oclock: '🕚',
  eleven_thirty: '🕦'
};
import { getAllUsers } from '../services/authService';
import { isRoomExpired } from '../services/roomService';
import { getOrCreatePrivateChat } from '../services/chatHistoryService';

interface SidebarProps {
  rooms: ChatRoom[];
  friends: User[];
  onSelectRoom: (room: ChatRoom) => void;
  onSelectPrivateChat: (chat: PrivateChat, otherUser: User) => void;
  activeChatId?: string | null;
  currentUser: User;
  onCreateRoom: () => void;
  onAddFriend: () => void;
  onRemoveFriend: (friendId: string) => void;
  onViewProfile: (user: User) => void;
  onInviteUser: (room: ChatRoom) => void;
  isGuest: boolean;
  unreadChats: Set<string>;
}

const Sidebar: React.FC<SidebarProps> = ({ rooms, friends, onSelectRoom, onSelectPrivateChat, activeChatId, currentUser, onCreateRoom, onAddFriend, onRemoveFriend, onViewProfile, onInviteUser, isGuest, unreadChats }) => {
  const [isFriendsExpanded, setIsFriendsExpanded] = useState(true);
  const [isUsersExpanded, setIsUsersExpanded] = useState(true);
  const [isMyRoomsExpanded, setIsMyRoomsExpanded] = useState(true);
  const [isUserRoomsExpanded, setIsUserRoomsExpanded] = useState(true);
  const [isOfficialRoomsExpanded, setIsOfficialRoomsExpanded] = useState(true);
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  
  // Get online users (all logged-in users, not just those in rooms)
  const getOnlineUsers = () => {
    const allUsers = getAllUsers();
    // Count all registered users + current guest (if guest)
    // This counts ALL logged-in users on the site, not just those in rooms
    const guestId = currentUser.id ? undefined : `guest-${currentUser.nickname}`;
    
    return allUsers.length + (guestId ? 1 : 0);
  };


  const UnreadIndicator = () => (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
    </span>
  );

  return (
    <div className="w-64 md:w-72 h-full bg-secondary/80 backdrop-blur-sm flex flex-col border-r border-accent/40 shadow-lg">
      <div className="p-4">
         {/* 简洁的顶部区域 */}
      </div>
      <div className="flex-1 overflow-y-auto">
        
        {/* Online Count Display */}
        <div className="p-4 text-center bg-green-500/15 m-4 rounded-lg border border-green-500/20">
            <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-semibold text-text-primary">
                    {getOnlineUsers()} Online
                </p>
            </div>
            <p className="text-xs text-text-secondary mt-1">
                {rooms.filter(room => !room.isOfficial).length} user rooms
            </p>
        </div>
        
        {/* Official Rooms */}
        <div>
            <div className="flex justify-between items-center px-4 pb-2 cursor-pointer" onClick={() => setIsOfficialRoomsExpanded(!isOfficialRoomsExpanded)}>
                <div className="flex items-center space-x-2">
                    {isOfficialRoomsExpanded ? (
                        <ChevronDownIcon className="w-4 h-4 text-text-secondary" />
                    ) : (
                        <ChevronRightIcon className="w-4 h-4 text-text-secondary" />
                    )}
                    <h3 className="text-sm font-semibold text-text-primary">Official Rooms</h3>
                </div>
            </div>
                    {isOfficialRoomsExpanded && (
                    <ul>
                {rooms.filter(room => room.isOfficial).map(room => {
                            const isClickable = !isGuest || room.isOfficial;
                    // Only show unread indicator for official rooms if they have real user messages (not just system messages)
                    const hasRealUserMessages = room.messages.some(msg => msg.sender.id !== 'system');
                    const hasUnread = unreadChats.has(room.id) && hasRealUserMessages;
                            return (
                                <li key={room.id}>
                                    <button 
                                        onClick={() => isClickable && onSelectRoom(room)} 
                                        className={`w-full text-left p-3 flex items-center space-x-3 transition-colors duration-200 ${ activeChatId === room.id ? 'bg-highlight/20' : 'hover:bg-accent/50'} ${!isClickable ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        disabled={!isClickable}
                                    >
                                        <div className="relative p-2 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full shadow-lg">
                                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-700 rounded-full animate-pulse opacity-75"></div>
                                            <div className="relative">
                                                <UsersIcon className="w-6 h-6 text-yellow-900 drop-shadow-sm" />
                                            </div>
                                            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur opacity-30 animate-ping"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                        <h3 className="font-semibold truncate text-text-primary">{room.name}</h3>
                                                {hasUnread && <UnreadIndicator />}
                                            </div>
                                    <p className="text-sm text-text-secondary truncate">{room.participants.length} participants</p>
                                </div>
                            </button>
                        </li>
                    );
                })}
                    </ul>
                    )}
        </div>

        {/* My Rooms - Only for registered users */}
        {!isGuest && (
            <div>
                <div className="flex justify-between items-center px-4 pb-2">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsMyRoomsExpanded(!isMyRoomsExpanded)}>
                        {isMyRoomsExpanded ? (
                            <ChevronDownIcon className="w-4 h-4 text-text-secondary" />
                        ) : (
                            <ChevronRightIcon className="w-4 h-4 text-text-secondary" />
                        )}
                        <h3 className="text-lg font-semibold text-text-primary">
                            My Rooms
                        </h3>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={onCreateRoom}
                            className="p-1 text-highlight hover:text-teal-400 transition-colors"
                            title="Create Room"
                        >
                            <PlusIcon className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
                {isMyRoomsExpanded && (
                    <ul>
                        {rooms.filter(room => !room.isOfficial && room.hostId === currentUser.id).sort((a, b) => {
                            // 按创建时间排序，最新的在上面
                            const timeA = new Date(a.createdAt || 0).getTime();
                            const timeB = new Date(b.createdAt || 0).getTime();
                            return timeB - timeA;
                        }).map(room => {
                            // For user-created rooms, only show unread if there are at least 2 participants
                            const hasMultipleParticipants = room.participants.filter(p => p.id && p.id !== 'system').length >= 2;
                            const hasUnread = unreadChats.has(room.id) && (room.isOfficial || hasMultipleParticipants);
                            const isExpired = isRoomExpired(room);
                            return (
                                <li key={room.id}>
                                    <button 
                                        onClick={() => onSelectRoom(room)} 
                                        className={`w-full text-left p-3 flex items-center space-x-3 transition-colors duration-200 ${ activeChatId === room.id ? 'bg-highlight/20' : 'hover:bg-accent/50'} ${isExpired ? 'opacity-60' : ''}`}
                                        disabled={isExpired}
                                    >
                                        <div className="p-2 bg-accent rounded-full flex items-center justify-center">
                                          {room.icon ? (
                                            <span className="text-lg">{ROOM_ICONS[room.icon] || '💬'}</span>
                                          ) : (
                                            <UsersIcon className="w-6 h-6 text-text-secondary" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold truncate text-text-primary">{room.name}</h3>
                                                    {room.roomType === 'private' && (
                                                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                                                            Private
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {room.roomType === 'private' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onInviteUser(room);
                                                            }}
                                                            className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                                                            title="Invite Users"
                                                        >
                                                            <UserPlusIcon className="w-4 h-4"/>
                                                        </button>
                                                    )}
                                                    {hasUnread && !isExpired && <UnreadIndicator />}
                                                </div>
                                            </div>
                                            <p className="text-sm text-text-secondary truncate">
                                                {isExpired ? 'Room expired' : `${room.participants.length} participants`}
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        )}

        {/* User Created Rooms - All other users' rooms */}
        <div>
            <div className="flex justify-between items-center px-4 pb-2">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsUserRoomsExpanded(!isUserRoomsExpanded)}>
                    {isUserRoomsExpanded ? (
                        <ChevronDownIcon className="w-4 h-4 text-text-secondary" />
                    ) : (
                        <ChevronRightIcon className="w-4 h-4 text-text-secondary" />
                    )}
                    <h3 className="text-lg font-semibold text-text-primary">
                        User Rooms
                    </h3>
                </div>
            </div>
            {isUserRoomsExpanded && (
                <ul>
                    {rooms.filter(room => {
                        // 只过滤官方房间
                        if (room.isOfficial) return false;
                        
                        // 对于私有房间，检查用户是否被邀请（包括房主）
                        if (room.roomType === 'private') {
                            // 房主可以看到自己的私有房间
                            return room.hostId === currentUser.id || (room.invitedUsers?.includes(currentUser.id!) || false);
                        }
                        
                        // 公开房间所有人都可以看到（包括自己创建的）
                        return true;
                    }).sort((a, b) => {
                        // 按创建时间排序，最新的在上面
                        const timeA = new Date(a.createdAt || 0).getTime();
                        const timeB = new Date(b.createdAt || 0).getTime();
                        return timeB - timeA;
                    }).map(room => {
                        // For user-created rooms, only show unread if there are at least 2 participants
                        const hasMultipleParticipants = room.participants.filter(p => p.id && p.id !== 'system').length >= 2;
                        const hasUnread = unreadChats.has(room.id) && (room.isOfficial || hasMultipleParticipants);
                        const isExpired = isRoomExpired(room);
                        return (
                            <li key={room.id}>
                                <button 
                                    onClick={() => onSelectRoom(room)} 
                                    className={`w-full text-left p-3 flex items-center space-x-3 transition-colors duration-200 ${ activeChatId === room.id ? 'bg-highlight/20' : 'hover:bg-accent/50'} ${isExpired ? 'opacity-60' : ''}`}
                                    disabled={isExpired}
                                >
                                    <div className="p-2 bg-accent rounded-full flex items-center justify-center">
                                      {room.icon ? (
                                        <span className="text-lg">{ROOM_ICONS[room.icon] || '💬'}</span>
                                      ) : (
                                        <UsersIcon className="w-6 h-6 text-text-secondary" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-semibold truncate text-text-primary">{room.name}</h3>
                                                {room.roomType === 'private' && (
                                                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                                                        Private
                                                    </span>
                                                )}
                                            </div>
                                            {hasUnread && !isExpired && <UnreadIndicator />}
                                        </div>
                                        <p className="text-sm text-text-secondary truncate">
                                            {isExpired ? 'Room expired' : `${room.participants.length} participants`}
                                        </p>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
            )}
        </div>


         {/* Friends Section */}
        {!isGuest && (
            <div className="mt-4">
                 <div className="flex justify-between items-center p-4">
                    <h2 className="text-lg font-semibold text-text-primary cursor-pointer" onClick={() => setIsFriendsExpanded(!isFriendsExpanded)}>
                        Friends
                    </h2>
                    <button onClick={(e) => { e.stopPropagation(); onAddFriend(); }} className="text-highlight hover:text-teal-400">
                        <UserPlusIcon className="w-6 h-6"/>
                    </button>
                </div>
                {isFriendsExpanded && (
                     <ul>
                        {friends.length === 0 && <p className="px-4 text-sm text-text-secondary">Your friend list is empty.</p>}
                        {friends.map(friend => (
                            <li key={friend.id}>
                                <div className="flex items-center">
                                <button
                                        onClick={() => {
                                            if (currentUser.id) {
                                                const privateChat = getOrCreatePrivateChat(currentUser.id, friend.id!);
                                                onSelectPrivateChat(privateChat, friend);
                                            }
                                        }}
                                        className={`flex-1 text-left p-3 flex items-center space-x-3 transition-colors duration-200 ${friend.gender === 'Female' ? 'hover:bg-pink-100/40' : 'hover:bg-accent/60'}`}
                                        title="Start private chat"
                                >
                                    <div className="relative">
                                    {friend.avatar ? (
                                        <div className={`w-10 h-10 rounded-full p-0.5 ${friend.gender === 'Female' ? 'bg-pink-300/80 ring-2 ring-pink-400/70' : 'bg-blue-300/80 ring-2 ring-blue-400/70'}`}>
                                            <img src={friend.avatar} alt={friend.nickname} className="w-full h-full rounded-full object-cover"/>
                                        </div>
                                    ) : (
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white self-start ${friend.gender === 'Female' ? 'bg-pink-500 ring-2 ring-pink-400/70' : 'bg-blue-500 ring-2 ring-blue-400/70'}`}>
                                            {friend.nickname.substring(0,2).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-secondary"></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-semibold truncate text-text-primary`}>{friend.nickname}</h3>
                                        <p className="text-sm text-text-secondary truncate">{`${friend.age}, ${friend.country}`}</p>
                                    </div>
                                </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveFriend(friend.id!);
                                        }}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded-lg transition-colors"
                                        title="Remove friend"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                     </ul>
                )}
            </div>
        )}
        

        {/* Online Users Section - for private chats */}
        <div className="mt-4">
            <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setIsUsersExpanded(!isUsersExpanded)}>
                <div className="flex items-center space-x-2">
                    {isUsersExpanded ? (
                        <ChevronDownIcon className="w-4 h-4 text-text-secondary" />
                    ) : (
                        <ChevronRightIcon className="w-4 h-4 text-text-secondary" />
                    )}
                    <h2 className="text-lg font-semibold text-text-primary">Online Users</h2>
                </div>
                <p className="text-sm text-text-secondary">
                    ({getOnlineUsers().filter(u => u.id !== currentUser.id && (!isGuest || !friends.some(f => f.id === u.id))).length} online)
                </p>
            </div>
                {isUsersExpanded && (
                <>
                    <div className="px-4 pb-2 flex items-center space-x-2 text-sm">
                        <span className="text-text-secondary">Show:</span>
                        <button
                            onClick={() => setGenderFilter('All')}
                            className={`px-3 py-1 rounded-full transition-colors ${genderFilter === 'All' ? 'bg-highlight text-white' : 'bg-accent text-text-primary hover:bg-accent/70'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setGenderFilter('Male')}
                            className={`px-3 py-1 rounded-full transition-colors ${genderFilter === 'Male' ? 'bg-highlight text-white' : 'bg-accent text-text-primary hover:bg-accent/70'}`}
                        >
                            Male
                        </button>
                        <button
                            onClick={() => setGenderFilter('Female')}
                            className={`px-3 py-1 rounded-full transition-colors ${genderFilter === 'Female' ? 'bg-highlight text-white' : 'bg-accent text-text-primary hover:bg-accent/70'}`}
                        >
                            Female
                        </button>
                    </div>
                    <ul>
                            {getOnlineUsers()
                                .filter(u => u.id !== currentUser.id && (!isGuest || !friends.some(f => f.id === u.id)))
                                .filter(user => {
                                    if (genderFilter === 'All') return true;
                                    return user.gender === genderFilter;
                                })
                                .length === 0 && <p className="px-4 pt-2 text-sm text-text-secondary">No online users match the filter.</p>}
                            {getOnlineUsers()
                                .filter(u => u.id !== currentUser.id && (!isGuest || !friends.some(f => f.id === u.id)))
                                .filter(user => {
                                    if (genderFilter === 'All') return true;
                                    return user.gender === genderFilter;
                                })
                                .map(user => {
                                    const isFriend = !isGuest && friends.some(f => f.id === user.id);
                                    return (
                                        <li key={user.id}>
                            <div
                                                onClick={() => {
                                                    // All users can chat with each other
                                                    const currentUserId = currentUser.id || `guest-${currentUser.nickname}`;
                                                    const targetUserId = user.id!;
                                                    const privateChat = getOrCreatePrivateChat(currentUserId, targetUserId);
                                                    onSelectPrivateChat(privateChat, user);
                                                }}
                                                className={`w-full text-left p-3 flex items-center space-x-3 transition-colors duration-200 cursor-pointer ${user.gender === 'Female' ? 'hover:bg-pink-100/40' : 'hover:bg-accent/60'}`}
                                                title="Start private chat"
                                >
                                    <div className="relative">
                                                    {user.avatar ? (
                                                        <div className={`w-10 h-10 rounded-full p-0.5 ${user.gender === 'Female' ? 'bg-pink-300/80 ring-2 ring-pink-400/70' : 'bg-blue-300/80 ring-2 ring-blue-400/70'}`}>
                                                            <img src={user.avatar} alt={user.nickname} className="w-full h-full rounded-full object-cover"/>
                                                        </div>
                                                    ) : (
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.gender === 'Female' ? 'bg-pink-500 ring-2 ring-pink-400/70' : 'bg-blue-500 ring-2 ring-blue-400/70'}`}>
                                                            {user.nickname.substring(0,2).toUpperCase()}
                                                        </div>
                                                    )}
                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-secondary"></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                                        <div className="flex items-center space-x-2">
                                                            <h3 className="font-semibold truncate text-text-primary">{user.nickname}</h3>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            {!isGuest && user.id && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onViewProfile(user); }}
                                                                    className="text-blue-400 hover:text-blue-300"
                                                                    title={`View ${user.nickname}'s profile`}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            {!isFriend && user.id && !user.id.startsWith('guest-') && !isGuest && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onAddFriend(user.id!); }}
                                                                    className="text-highlight hover:text-teal-400"
                                                                    title={`Add ${user.nickname} as a friend`}
                                                                >
                                                                    <UserPlusIcon className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                        </div>
                                                    <p className="text-sm text-text-secondary truncate">{`${user.age}, ${user.gender} • ${user.country}`}</p>
                                    </div>
                            </div>
                                </li>
                                    );
                        })}
                    </ul>
                </>
            )}
        </div>
        
      </div>
       {/* 用户功能已移至顶部导航栏 */}
    </div>
  );
};

export default Sidebar;