export interface User {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  color?: string;
  password?: string; // Only for local simulation
  isBot?: boolean;
}

export interface Message {
  id: string;
  content: string; // Text content or Data URL for audio
  type: 'text' | 'audio';
  author: User;
  timestamp: string; // JSON serialization stores dates as strings
  attachment?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'announcement';
  categoryId?: string;
  unreadCount?: number;
}

export interface Category {
  id: string;
  name: string;
  channels: Channel[];
}

export interface Server {
  id: string;
  name: string;
  icon?: string;
  categories: Category[];
  members: User[];
}