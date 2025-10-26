import type { ChatRoom } from './types';

export const OFFICIAL_ROOMS: ChatRoom[] = [
  {
    id: 'official-1',
    name: '☕ The Coffee Corner',
    participants: [],
    messages: [
      {
        id: 'initial-official-1',
        text: 'Welcome to The Coffee Corner! A cozy place to chat about anything from technology to art and music. Grab a cup and join the conversation.',
        sender: {
          id: 'system',
          nickname: 'System',
          age: 0,
          gender: 'Other',
          country: 'Global',
          avatar: '',
          bio: 'System message'
        },
        timestamp: "9:00 AM"
      }
    ],
    isOfficial: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'official-2',
    name: '✈️ Global Travelers',
    participants: [],
    messages: [
      {
        id: 'initial-official-2',
        text: 'Welcome, fellow traveler! Share your favorite destinations, travel stories, and cultural experiences with us.',
        sender: {
          id: 'system',
          nickname: 'System',
          age: 0,
          gender: 'Other',
          country: 'Global',
          avatar: '',
          bio: 'System message'
        },
        timestamp: "9:01 AM"
      }
    ],
    isOfficial: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'official-3',
    name: '💪 Wellness Hub',
    participants: [],
    messages: [
      {
        id: 'initial-official-3',
        text: 'Join us in the Wellness Hub to discuss fitness, healthy recipes, and mindfulness. Let\'s get motivated together!',
        sender: {
          id: 'system',
          nickname: 'System',
          age: 0,
          gender: 'Other',
          country: 'Global',
          avatar: '',
          bio: 'System message'
        },
        timestamp: "9:02 AM"
      }
    ],
    isOfficial: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'official-4',
    name: '🌙 Late Night Talks',
    participants: [],
    messages: [
      {
        id: 'initial-official-4',
        text: 'The world is quiet. What\'s on your mind? Share your late-night thoughts, dreams, or just unwind with us.',
        sender: {
          id: 'system',
          nickname: 'System',
          age: 0,
          gender: 'Other',
          country: 'Global',
          avatar: '',
          bio: 'System message'
        },
        timestamp: "11:00 PM"
      }
    ],
    isOfficial: true,
    createdAt: new Date().toISOString()
  }
];