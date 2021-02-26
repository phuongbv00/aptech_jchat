import { ChatMessage } from 'src/app/shared/models/chat-message.model';
import { TopicConstant } from './../../shared/constants/topic.constant';
import { ChatTopic } from '../../shared/models/chat-topic.model';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Subscription } from 'rxjs';
import { Message } from '@stomp/stompjs';
import { WebsocketMessage } from 'src/app/shared/dto/websocket-message.dto';
import {ChatService} from '../../shared/services/chat.service';
import {map} from 'rxjs/operators';
import {NbDialogService, NbToastrService} from '@nebular/theme';
import {Pageable} from '../../shared/dto/pageable.dto';
import {User} from '../../shared/models/user.model';
import {EventConstant} from '../../shared/constants/event.constant';
import {AuthService} from '../../shared/services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  topics: ChatTopic[] = [];
  topicSelected: ChatTopic;
  searchedUsers: Pageable<User>;

  // subscriptions
  private exceptionSub: Subscription;
  private sendTextChatSub: Subscription;
  private getChatTopicsSub: Subscription;
  private getUsersSub: Subscription;
  private createChatTopicSub: Subscription;

  constructor(private rxStompService: RxStompService,
              private chatService: ChatService,
              private authService: AuthService,
              public dialogService: NbDialogService,
              private toastrService: NbToastrService) {
    this.authService.getToken()
      .pipe(map(token => token.getPayload()))
      .subscribe(payload => this.authService.saveCredentials(payload.credentials));

    // register subscriptions
    this.sendTextChatSub = this.rxStompService
      .watch(`${TopicConstant.SEND_TEXT_CHAT}/${this.authService.getCredentials().id}`)
      .subscribe((message: Message) => this.handleSendTextChatSub(JSON.parse(message.body)));
    this.exceptionSub = this.rxStompService
      .watch(`${TopicConstant.EXCEPTION}/${this.authService.getCredentials().id}`)
      .subscribe((message: Message) => this.handleExceptionSub(JSON.parse(message.body)));
    this.getChatTopicsSub = this.rxStompService
      .watch(`${TopicConstant.GET_CHAT_TOPICS}/${this.authService.getCredentials().id}`)
      .subscribe((message: Message) => this.handleGetChatTopicsSub(JSON.parse(message.body)));
    this.getUsersSub = this.rxStompService
      .watch(`${TopicConstant.GET_USERS}/${this.authService.getCredentials().id}`)
      .subscribe((message: Message) => this.handleGetUsersSub(JSON.parse(message.body)));
    this.createChatTopicSub = this.rxStompService
      .watch(`${TopicConstant.CREATE_CHAT_TOPIC}/${this.authService.getCredentials().id}`)
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
  handleExceptionSub(ex: any): void {
    console.error(ex);
    this.toastrService.danger(ex.message, 'Error');
  }

  handleSendTextChatSub(mess: ChatMessage): void {
    console.log(mess);
    for (const k in this.topics) {
      if (this.topics[k].id === mess.topic.id) {
        this.topics[k].lastMessage = mess.topic.lastMessage;
        this.topics[k].updatedBy = mess.topic.updatedBy;
        this.topics[k].updatedAt = mess.topic.updatedAt;
        this.topics[k].messages.push(mess);
        this.arrayMove(this.topics, k, 0);
        break;
      }
    }
  }

  handleGetChatTopicsSub(topics: ChatTopic[]): void {
    this.topics = topics
      .map(topic => this.chatService.refactorChatTopic(topic, this.authService.getCredentials().id));
    this.onTopicSelected(this.topics[0]);
    console.log(this.topics);
  }

  handleGetUsersSub(users: Pageable<User>): void {
    this.searchedUsers = users;
  }

  handleCreateChatTopicSub(topic: ChatTopic): void {
    this.topics.unshift(this.chatService.refactorChatTopic(topic, this.authService.getCredentials().id));
    console.log(topic);
  }

  // normal func
  sentChat(mess: WebsocketMessage): void {
    this.chatService.send(mess);
  }

  onTopicSelected(topic: ChatTopic): void {
    this.topicSelected = topic;
  }

  arrayMove(arr, fromIndex, toIndex): void {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  }
}
