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

  settings1 = [{title: 'Leave Group'}];
  settings2 = [{title: 'Edit Group'}, {title: 'Leave Group'}];

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
          case 'Edit Group':
            this.openEditChatTopicDialog.emit();
            break;
          case 'Leave Group':
            this.openLeaveChatGroupDialog.emit();
            break;
        }
      });
  }

  isMyTopic(topic: ChatTopic): boolean {
    return topic.createdBy.id === this.authService.getCredentials().id;
  }

  getParticipantNames(): string {
    return this.topicSelected.participants
      .map(p => p.fullName)
      .reduce((acc, cur) => acc === '' ? cur : acc + ', ' + cur, '');
  }
}
