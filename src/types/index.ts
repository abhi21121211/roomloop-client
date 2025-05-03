// User types
export interface User {
  id: string;
  username: string;
  email: string;
  createdRooms?: string[];
  joinedRooms?: string[];
  invitedToRooms?: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
}

// Room types
export enum RoomStatus {
  SCHEDULED = "scheduled",
  LIVE = "live",
  CLOSED = "closed",
}

export enum RoomType {
  PUBLIC = "public",
  PRIVATE = "private",
}

export interface Room {
  _id: string;
  title: string;
  description: string;
  roomType: RoomType;
  status: RoomStatus;
  creator: User | string;
  startTime: string | Date;
  endTime: string | Date;
  maxParticipants?: number;
  participants: User[] | string[];
  invitedUsers: User[] | string[];
  tags: string[];
  code: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface RoomState {
  rooms: {
    upcoming: Room[];
    live: Room[];
    past: Room[];
    invites: Room[];
  };
  publicRooms: Room[];
  currentRoom: Room | null;
  loading: boolean;
  error: string | null;
}

// Message types
export interface Message {
  _id: string;
  content: string;
  sender: User | string;
  room: Room | string;
  createdAt: string | Date;
}

export interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

// Reaction types
export interface Reaction {
  _id: string;
  emoji: string;
  user: User | string;
  room: Room | string;
  createdAt: string | Date;
}

export interface ReactionState {
  reactions: Reaction[];
  loading: boolean;
  error: string | null;
}

// Form types
export interface LoginFormData {
  login: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateRoomFormData {
  title: string;
  description: string;
  roomType: RoomType;
  startTime: Date;
  endTime: Date;
  maxParticipants?: number;
  tags: string[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
