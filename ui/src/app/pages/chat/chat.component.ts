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

const MAX_CHAT_HISTORY = 20;

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
  private getChatHistorySub: Subscription;
  private chatSeenSub: Subscription;
  private removeChatGroupSub: Subscription;
  private updateChatGroupSub: Subscription;

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
    this.getChatHistorySub = this.rxStompService
      .watch(`${TopicConstant.GET_CHAT_HISTORY}/${this.authService.getCredentials().id}`)
      .subscribe((message: Message) => this.handleGetChatHistorySub(JSON.parse(message.body)));
    this.chatSeenSub = this.rxStompService
      .watch(`${TopicConstant.CHAT_SEEN}/${this.authService.getCredentials().id}`)
      .subscribe((message: Message) => this.handleChatSeenSub(JSON.parse(message.body)));
    this.removeChatGroupSub = this.rxStompService
      .watch(`${TopicConstant.REMOVE_CHAT_GROUP}/${this.authService.getCredentials().id}`)
      .subscribe((message: Message) => this.handleRemoveChatGroupSub(JSON.parse(message.body)));
    this.updateChatGroupSub = this.rxStompService
      .watch(`${TopicConstant.UPDATE_CHAT_GROUP}/${this.authService.getCredentials().id}`)
      .subscribe((message: Message) => this.handleUpdateChatGroupSub(JSON.parse(message.body)));
  }

  ngOnInit(): void {
    this.chatService.send({
      event: EventConstant.GET_CHAT_TOPICS,
    });
  }

  ngOnDestroy(): void {
    // unsubscribe subscriptions
    this.exceptionSub.unsubscribe();
    this.sendTextChatSub.unsubscribe();
    this.getChatTopicsSub.unsubscribe();
    this.getUsersSub.unsubscribe();
    this.createChatTopicSub.unsubscribe();
    this.getChatHistorySub.unsubscribe();
    this.chatSeenSub.unsubscribe();
    this.removeChatGroupSub.unsubscribe();
    this.updateChatGroupSub.unsubscribe();
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
        if (this.topics[k].id !== this.topicSelected?.id) {
          this.topics[k].unseen = true;
        } else {
          this.chatService.send({
            event: EventConstant.CHAT_SEEN,
            data: new Map([
              ['topicId', this.topicSelected.id.toString()],
            ]),
          });
        }
        this.arrayMove(this.topics, k, 0);
        break;
      }
    }
  }

  handleGetChatTopicsSub(topics: ChatTopic[]): void {
    this.topics = topics
      .map(topic => this.chatService.refactorChatTopic(topic, this.authService.getCredentials().id));
    for (const k in this.topics) {
      if (!this.topics[k].unseen) {
        this.onTopicSelected(this.topics[k]);
        break;
      }
    }
    console.log(this.topics);
  }

  handleGetUsersSub(users: Pageable<User>): void {
    this.searchedUsers = users;
  }

  handleCreateChatTopicSub(topic: ChatTopic): void {
    this.topics.unshift(this.chatService.refactorChatTopic(topic, this.authService.getCredentials().id));
    console.log(topic);
  }

  handleGetChatHistorySub(messList: ChatMessage[]): void {
    console.log(messList);
    this.topicSelected.messages.unshift(...messList);
  }

  handleChatSeenSub(topicId: number): void {
    console.log(topicId);
    for (const topic of this.topics) {
      if (topic.id === topicId) {
        topic.unseen = false;
        break;
      }
    }
  }

  handleRemoveChatGroupSub(topic: ChatTopic): void {
    this.topics = this.topics.filter(t => t.id !== topic.id);
    if (this.topicSelected.id === topic.id) {
      this.topicSelected = null;
    }
  }

  handleUpdateChatGroupSub(topic: ChatTopic): void {
    for (const k in this.topics) {
      if (this.topics[k].id === topic.id) {
        this.topics[k].updatedBy = topic.updatedBy;
        this.topics[k].updatedAt = topic.updatedAt;
        this.topics[k].title = topic.title;
        this.topics[k].participants = topic.participants;
        break;
      }
    }
  }

  // normal func
  sentChat(mess: WebsocketMessage): void {
    this.chatService.send(mess);
  }

  onTopicSelected(topic: ChatTopic): void {
    this.topicSelected = topic;
    const data = new Map([
      ['topicId', this.topicSelected.id],
    ]);
    // seen message
    if (this.topicSelected.unseen) {
      this.chatService.send({
        event: EventConstant.CHAT_SEEN,
        data: new Map([
          ['topicId', this.topicSelected.id.toString()],
        ]),
      });
    }
    // get chat history
    if (this.topicSelected.messages.length < MAX_CHAT_HISTORY) {
      this.loadHistory();
    }
  }

  arrayMove(arr, fromIndex, toIndex): void {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  }

  loadHistory(): void {
    const evt = {
      event: EventConstant.GET_CHAT_HISTORY,
      data: new Map([
        ['topicId', this.topicSelected.id.toString()],
        ['limit', MAX_CHAT_HISTORY.toString()],
      ]),
    };
    if (this.topicSelected.messages.length > 0) {
      evt.data.set('beforeMessageId', this.topicSelected.messages[0].id.toString());
    }
    this.chatService.send(evt);
  }
}
