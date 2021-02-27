import { ChatTopic } from './chat-topic.model';
import { User } from './user.model';
export class ChatMessage {
    id: number;
    text: string;
    topic: ChatTopic;
    createdBy: User;
    createdAt: number[];
}
