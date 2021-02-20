import { ChatMessage } from 'src/app/shared/models/chat-message.model';
import { TopicConstant } from './../../shared/constants/topic.constant';
import { ChatTopic } from '../../shared/models/chat-topic.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Subscription } from 'rxjs';
import { Message, StompHeaders } from '@stomp/stompjs';
import { WebsocketMessage } from 'src/app/shared/dto/websocket-message.dto';
import {ChatService} from '../../shared/services/chat.service';
import {EventConstant} from '../../shared/constants/event.constant';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  topics: ChatTopic[] = [];
  topicSelected: ChatTopic;

  // subscriptions
  private sendTextChatSub: Subscription;
  private getChatTopicsSub: Subscription;

  constructor(private rxStompService: RxStompService,
              private chatService: ChatService) {
    this.sendTextChatSub = this.rxStompService
      .watch(`${TopicConstant.SEND_TEXT_CHAT}/{id}`)
      .subscribe((message: Message) => this.onTextChatReceived(JSON.parse(message.body)));
    this.getChatTopicsSub = this.rxStompService
      .watch(`${TopicConstant.GET_CHAT_TOPICS}/{myId}`)
      .subscribe((message: Message) => this.onGetMyTopics(JSON.parse(message.body)));
  }

  ngOnInit(): void {
    this.chatService.send({
      event: EventConstant.GET_USERS,
      data: new Map([
        ['page', '1'],
        ['limit', '5'],
        ['keyword', ''],
      ]),
    });
  }

  ngOnDestroy(): void {
    this.sendTextChatSub.unsubscribe();
    this.getChatTopicsSub.unsubscribe();
  }

  onSent(mess: WebsocketMessage): void {
    this.chatService.send(mess);
  }

  onTextChatReceived(mess: ChatMessage): void {
    this.topics.forEach(topic => {
      if (topic.id === mess.topic.id) {
        topic.messages.push(mess);
      }
    });
  }

  onTopicSelected(topic: ChatTopic): void {
    this.topicSelected = topic;
  }

  onGetMyTopics(topics: ChatTopic[]): void {
    this.topics = topics;
    this.onTopicSelected(topics[0]);
  }
}
