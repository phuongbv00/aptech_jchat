import { ChatMessage } from 'src/app/shared/models/chat-message.model';
import { TopicConstant } from './../../shared/constants/topic.constant';
import { ChatTopic } from '../../shared/models/chat-topic.model';
import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Subscription } from 'rxjs';
import { Message, StompHeaders } from '@stomp/stompjs';
import { WebsocketMessage } from 'src/app/shared/dto/websocket-message.dto';
import {ChatService} from '../../shared/services/chat.service';
import {NbAuthService} from '@nebular/auth';
import {map} from 'rxjs/operators';
import {NbDialogService} from '@nebular/theme';
import {Pageable} from '../../shared/dto/pageable.dto';
import {User} from '../../shared/models/user.model';
import {EventConstant} from "../../shared/constants/event.constant";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  authPayload: any;
  topics: ChatTopic[] = [];
  topicSelected: ChatTopic;
  searchedUsers: Pageable<User>;

  // subscriptions
  private sendTextChatSub: Subscription;
  private getChatTopicsSub: Subscription;
  private getUsersSub: Subscription;
  private createChatTopicSub: Subscription;

  constructor(private rxStompService: RxStompService,
              private chatService: ChatService,
              private authService: NbAuthService,
              private dialogService: NbDialogService) {
    this.authService.getToken()
      .pipe(map(token => token.getPayload()))
      .subscribe(payload => this.authPayload = payload);

    // register subscriptions
    this.sendTextChatSub = this.rxStompService
      .watch(`${TopicConstant.SEND_TEXT_CHAT}/{id}`)
      .subscribe((message: Message) => this.handleSendTextChatSub(JSON.parse(message.body)));
    this.getChatTopicsSub = this.rxStompService
      .watch(`${TopicConstant.GET_CHAT_TOPICS}/${this.authPayload.credentials.id}`)
      .subscribe((message: Message) => this.handleGetChatTopicsSub(JSON.parse(message.body)));
    this.getUsersSub = this.rxStompService
      .watch(`${TopicConstant.GET_USERS}/${this.authPayload.credentials.id}`)
      .subscribe((message: Message) => this.handleGetUsersSub(JSON.parse(message.body)));
    this.createChatTopicSub = this.rxStompService
      .watch(`${TopicConstant.CREATE_CHAT_TOPIC}/${this.authPayload.credentials.id}`)
      .subscribe((message: Message) => this.handleCreateChatTopicSub(JSON.parse(message.body)));
  }

  ngOnInit(): void {
    this.chatService.send({
      event: EventConstant.GET_CHAT_TOPICS,
    });
  }

  ngOnDestroy(): void {
    // unsubscribe subscriptions
    this.sendTextChatSub.unsubscribe();
    this.getChatTopicsSub.unsubscribe();
    this.getUsersSub.unsubscribe();
    this.createChatTopicSub.unsubscribe();
  }

  // handle subscriptions
  handleSendTextChatSub(mess: ChatMessage): void {
    this.topics.forEach(topic => {
      if (topic.id === mess.topic.id) {
        topic.messages.push(mess);
      }
    });
  }

  handleGetChatTopicsSub(topics: ChatTopic[]): void {
    this.topics = topics.map(topic => {
      const isGroup = topic.participants.length > 2;
      if (isGroup) {
        return {
          ...topic,
          avatar: topic.avatar ?? 'assets/group-default.png',
        };
      }
      const opponent = topic.participants.find(u => u.id !== this.authPayload.credentials.id);
      return {
        ...topic,
        avatar: opponent.avatar ?? 'assets/user-default.png',
        title: opponent.fullName,
      };
    });
    this.onTopicSelected(this.topics[0]);
  }

  handleGetUsersSub(users: Pageable<User>): void {
    this.searchedUsers = users;
  }

  handleCreateChatTopicSub(topic: ChatTopic): void {
    console.log(topic);
  }

  // normal func
  sentChat(mess: WebsocketMessage): void {
    this.chatService.send(mess);
  }

  onTopicSelected(topic: ChatTopic): void {
    this.topicSelected = topic;
  }
}
