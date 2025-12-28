export type MessageType = 'CHAT' | 'JOIN' | 'LEAVE' | 'ERROR';

export interface ChatMessage {
    type: MessageType;
    content: string;
    sender: string;
    roomId: string;
    timestamp: string;
}

export interface Room {
    id: string;
    users: string[];
    messageHistory: ChatMessage[];
}
