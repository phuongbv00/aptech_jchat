import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Pageable} from '../../../shared/dto/pageable.dto';
import {User} from '../../../shared/models/user.model';
import {ChatTopic} from '../../../shared/models/chat-topic.model';
import {EventConstant} from '../../../shared/constants/event.constant';
import {ChatService} from '../../../shared/services/chat.service';
import {AuthService} from '../../../shared/services/auth.service';

@Component({
  selector: 'app-chat-topic-update',
  templateUrl: './chat-topic-update.component.html',
  styleUrls: ['./chat-topic-update.component.scss']
})
export class ChatTopicUpdateComponent implements OnInit {
  @Output() closeDialog = new EventEmitter<any>();
  @Input() users: Pageable<User>;
  @Input() topic: ChatTopic;

  timer: any;
  highlightStatus: Map<any, any>;
  participants: User[];
  title: string;

  constructor(private chatService: ChatService,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.participants = [...this.topic.participants];
    this.title = this.topic.title;
    this.searchUsers();
    this.highlightStatus = new Map(this.participants.map(u => [u.id, true]));
  }

  updateTopic(): void {
    this.chatService.send({
      event: EventConstant.UPDATE_CHAT_GROUP,
      data: new Map([
        ['topicId', this.topic.id.toString()],
        ['participants', JSON.stringify(this.participants)],
        ['title', this.title],
      ]),
    });
    this.closeDialog.emit();
  }

  isValidTopic(): boolean {
    return this.participants.length > 2;
  }

  searchUsersOnGroupTab(keyword: string): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.searchUsers(0, keyword);
    }, 500);
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

  selectUserToCreateGroupTopic(user: User): void {
    if (this.participants.some(u => u.id === user.id)) {
      this.popUser(user);
    } else {
      this.pickUser(user);
    }
  }

  popUser(user: User): void {
    this.participants = this.participants.filter(u => u.id !== user.id);
    this.highlightStatus.delete(user.id);
  }

  pickUser(user: User): void {
    this.participants.push(user);
    this.highlightStatus.set(user.id, true);
  }

  isMe(u: User): boolean {
    return this.authService.getCredentials().id === u.id;
  }
}
