import { ChatMessage } from 'src/app/shared/models/chat-message.model';
import { TopicConstant } from './../../shared/constants/topic.constant';
import { ChatTopic } from '../../shared/models/chat-topic.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Subscription } from 'rxjs';
import { Message, StompHeaders } from '@stomp/stompjs';
import { WebsocketMessage } from 'src/app/shared/dto/websocket-message.dto';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  topics: ChatTopic[] = [
    {
      id: '1',
      title: 'Abc',
      updatedBy: {
        email: '',
        fullName: 'A',
        id: 999,
        status: 1,
      },
      createdBy: {
        email: '',
        fullName: 'A',
        id: 999,
        status: 1,
      },
      participants: [],
      updatedAt: '1 mins',
      messages: [],
      avatar: 'https://cdn1.tuoitre.vn/zoom/600_315/2020/2/16/dscf9323-15818618595722127173381-crop-15818630577631485418054.jpg',
    },
    {
      id: '2',
      title: 'Def',
      updatedBy: {
        email: '',
        fullName: 'A',
        id: 999,
        status: 1,
      },
      createdBy: {
        email: '',
        fullName: 'A',
        id: 999,
        status: 1,
      },
      participants: [],
      updatedAt: '1 mins',
      messages: [],
      avatar: 'https://cdn1.tuoitre.vn/zoom/600_315/2020/2/16/dscf9323-15818618595722127173381-crop-15818630577631485418054.jpg',
    },
  ];
  topicSelected: ChatTopic = this.topics[0];

  private publicChatTopicSub: Subscription;

  constructor(private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.publicChatTopicSub = this.rxStompService
      .watch(`${TopicConstant.SEND_TEXT_CHAT}/{id}`)
      .subscribe((message: Message) => this.onReceived(JSON.parse(message.body)));
  }

  ngOnDestroy(): void {
    this.publicChatTopicSub.unsubscribe();
  }

  onSent(mess: WebsocketMessage): void {
    const headers: StompHeaders = {
      token: JSON.parse(localStorage.getItem('auth_app_token')).value,
    };
    this.rxStompService.publish({
      destination: '/app/index',
      body: JSON.stringify(mess),
      headers,
    });
  }

  onReceived(mess: ChatMessage): void {
    this.topics.forEach(topic => {
      if (topic.id === mess.topic.id) {
        topic.messages.push(mess);
      }
    });
  }

  onTopicSelected(topic: ChatTopic): void {
    this.topicSelected = topic;
  }
}
