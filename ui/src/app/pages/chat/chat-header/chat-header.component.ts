import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {ChatTopic} from '../../../shared/models/chat-topic.model';
import {AuthService} from '../../../shared/services/auth.service';
import {NbMenuService} from '@nebular/theme';
import {filter, map} from 'rxjs/operators';

@Component({
  selector: 'app-chat-header',
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.scss']
})
export class ChatHeaderComponent implements OnInit {
  @Input() topicSelected: ChatTopic;
  @Output() openEditChatTopicDialog = new EventEmitter<any>();
  @Output() openLeaveChatGroupDialog = new EventEmitter<any>();
  @Output() openEditChatGroupAvatarDialog = new EventEmitter<any>();

  memberSettings = [{title: 'Edit Avatar'}, {title: 'Leave Group'}];
  creatorSettings = [{title: 'Edit Group'}, ...this.memberSettings];

  constructor(private authService: AuthService,
              private menuService: NbMenuService) { }

  ngOnInit(): void {
    this.menuService.onItemClick()
      .pipe(
        filter(menuBag => menuBag.tag === 'groupChatSettings'),
        map(menuBag => menuBag.item.title),
      )
      .subscribe(title => {
        switch (title) {
          case this.creatorSettings[0].title:
            this.openEditChatTopicDialog.emit();
            break;
          case this.memberSettings[0].title:
            this.openEditChatGroupAvatarDialog.emit();
            break;
          case this.memberSettings[1].title:
            this.openLeaveChatGroupDialog.emit();
            break;
        }
      });
  }

  isMyTopic(topic: ChatTopic): boolean {
    return topic.createdBy.id === this.authService.getCredentials().id;
  }

  getParticipantNames(): string {
    if (!this.topicSelected.isGroup) {
      return this.topicSelected.participants
        .find(p => p.id !== this.authService.getCredentials().id)
        .fullName;
    }
    return this.topicSelected.participants
      .map(p => p.fullName)
      .reduce((acc, cur) => acc === '' ? cur : acc + ', ' + cur, '');
  }
}
