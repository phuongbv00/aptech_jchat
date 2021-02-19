import { ChatMessage } from './chat-message.model';
import { User } from './user.model';
export class ChatTopic {
    id: string;
    title?: string;
    createdBy: User;
    updatedBy: User;
    participants: User[];
    avatar?: string;
    updatedAt?: string;
    createdAt?: string;
    messages: ChatMessage[];
}
