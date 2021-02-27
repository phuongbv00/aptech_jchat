import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {ChatService} from '../../../shared/services/chat.service';
import {EventConstant} from '../../../shared/constants/event.constant';
import {Pageable} from '../../../shared/dto/pageable.dto';
import {ChatTopic} from '../../../shared/models/chat-topic.model';
import {User} from '../../../shared/models/user.model';

@Component({
  selector: 'app-chat-topic-create',
  templateUrl: './chat-topic-create.component.html',
  styleUrls: ['./chat-topic-create.component.scss']
})
export class ChatTopicCreateComponent implements OnInit {
  @Output() closeDialog = new EventEmitter<any>();
  @Input() users: Pageable<User>;

  timer: any;
  topic: ChatTopic = {
    participants: [],
    title: '',
  };
  highlightStatus: Map<any, any> = new Map();
  isOnGroupTab = true;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.searchUsers();
  }

  createTopic(isGroup: boolean): void {
    if (!isGroup) { this.topic.title = ''; }
    this.chatService.send({
      event: EventConstant.CREATE_CHAT_TOPIC,
      data: new Map([
        ['topic', JSON.stringify(this.topic)],
        ['isGroup', isGroup + ''],
      ]),
    });
    this.closeDialog.emit();
  }

  searchUsers(page: number = 0, keyword: string = ''): void {
    this.chatService.send({
      event: EventConstant.GET_USERS,
      data: new Map([
        ['page', page.toString()],
        ['limit', '5'],
        ['keyword', keyword],
      ]),
    });
  }

  searchUsersOnPersonTab(keyword: string): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.searchUsers(0, keyword);
      this.resetUsersSelected();
    }, 500);
  }

  searchUsersOnGroupTab(keyword: string): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.searchUsers(0, keyword);
    }, 500);
  }

  selectUserToCreatePersonTopic(user: User): void {
    this.resetUsersSelected();
    this.pickUser(user);
  }

  selectUserToCreateGroupTopic(user: User): void {
    if (this.topic.participants.some(u => u.id === user.id)) {
      this.popUser(user);
    } else {
      this.pickUser(user);
    }
    console.log(this.topic.participants);
  }

  resetUsersSelected(): void {
    this.highlightStatus.clear();
    this.topic.participants = [];
  }

  popUser(user: User): void {
    this.topic.participants = this.topic.participants.filter(u => u.id !== user.id);
    this.highlightStatus.delete(user.id);
  }

  pickUser(user: User): void {
    this.topic.participants.push(user);
    this.highlightStatus.set(user.id, true);
  }

  changeTab(evt: any): void {
    console.log(evt);
    this.isOnGroupTab = evt.tabTitle === 'Group';
    this.resetUsersSelected();
    this.topic.title = '';
  }

  isValidTopic(): boolean {
    if (this.isOnGroupTab) {
      return this.topic.participants.length > 1;
    }
    return this.topic.participants.length > 0;
  }
}
