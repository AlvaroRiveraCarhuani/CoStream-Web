export type UserRole = 'HOST' | 'PRESENTER' | 'VIEWER';

export interface ChatMessage {
  id: string;
  senderId?: string;
  senderName: string;
  role?: string;
  avatar?: string;    
  text: string;             
  type?: 'text' | 'image';
  timestamp: string;
}

export interface RoomParticipant {
userId: string;
name: string;
role: UserRole;
isOnStage: boolean;
}

export interface RoomState {
roomId: string;
participants: RoomParticipant[];
}
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatar: string; 
  exp?: number;   
}
export interface AuthResponse {
  accessToken: string;
}

export interface PublicRoom {
  id: string;
  title: string;
  hostName: string;
  createdAt: string;
  requiresPin?: boolean;
  isPublic?: boolean;
}

export interface RoomHistory {
  id: string;
  title: string;
  createdAt: string;
  endedAt: string;
  durationMinutes: number;
  totalMessages: number;
  totalParticipants: number;
}

export interface RoomJoinResponse {
  roomId?: string;
  success?: boolean;
  hostToken?: string;
  guestToken?: string;
  livekitUrl: string;
  assignedRole?: UserRole;
}
