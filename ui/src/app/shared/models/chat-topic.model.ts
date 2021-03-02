import { ChatMessage } from './chat-message.model';
import { User } from './user.model';
export class ChatTopic {
    id?: number;
    title?: string;
    createdBy?: User;
    updatedBy?: User;
    participants?: User[];
    avatar?: string;
    updatedAt?: number[];
    createdAt?: number[];
    messages?: ChatMessage[];
    lastMessage?: string;
    unseen?: boolean;
    isGroup?: boolean;
}
