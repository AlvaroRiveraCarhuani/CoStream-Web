export type UserRole = 'HOST' | 'PRESENTER' | 'VIEWER';

export interface ChatMessage {
id: string;          
senderName: string;  
role: UserRole;      
content: string;     
timestamp: string | Date; 
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