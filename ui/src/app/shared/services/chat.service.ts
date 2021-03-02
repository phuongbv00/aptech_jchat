import { Injectable } from '@angular/core';
import {RxStompService} from '@stomp/ng2-stompjs';
import {WebsocketMessage} from '../dto/websocket-message.dto';
import {ChatTopic} from '../models/chat-topic.model';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private rxStompService: RxStompService) { }

  send(mess: WebsocketMessage): void {
    this.rxStompService.publish({
      destination: '/app/index',
      headers: {
        token: JSON.parse(localStorage.getItem('auth_app_token'))?.value,
      },
      body: JSON.stringify(mess, this.replacer),
    });
  }

  private replacer(key, value): any {
    if (value instanceof Map) {
      const jsonObject = {};
      value.forEach((v, k) => {
        jsonObject[k] = v;
      });
      return jsonObject;
    }
    return value;
  }

  private reviver(key, value): any {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }

  refactorChatTopic(topic: ChatTopic, myId: number): ChatTopic {
    const isGroup = topic.isGroup;
    const rs = {
      ...topic,
      messages: topic.messages ?? [],
    };
    if (!isGroup) {
      const opponent = topic.participants.find(u => u.id !== myId);
      rs.title = opponent.fullName;
    }
    return rs;
  }
}
