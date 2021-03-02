import { ChatComponent } from './chat.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { FormsModule } from '@angular/forms';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatFormComponent } from './chat-form/chat-form.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import {
  NbSidebarModule,
  NbLayoutModule,
  NbInputModule,
  NbButtonModule,
  NbIconModule,
  NbListModule,
  NbBadgeModule,
  NbCardModule, NbSelectModule, NbTabsetModule, NbContextMenuModule, NbTooltipModule
} from '@nebular/theme';
import { ChatProfileComponent } from './chat-profile/chat-profile.component';
import { ChatTopicCreateComponent } from './chat-topic-create/chat-topic-create.component';
import {SharedModule} from '../../shared/shared.module';
import { ChatTopicUpdateComponent } from './chat-topic-update/chat-topic-update.component';
import { ChatHeaderComponent } from './chat-header/chat-header.component';


@NgModule({
  declarations: [ChatComponent, ChatListComponent, ChatFormComponent, ChatBoxComponent, ChatProfileComponent, ChatTopicCreateComponent, ChatTopicUpdateComponent, ChatHeaderComponent],
  imports: [
    CommonModule,
    ChatRoutingModule,
    FormsModule,
    NbSidebarModule,
    NbLayoutModule,
    NbInputModule,
    NbButtonModule,
    NbIconModule,
    NbListModule,
    NbBadgeModule,
    NbCardModule,
    NbSelectModule,
    NbTabsetModule,
    SharedModule,
    NbContextMenuModule,
    NbTooltipModule,
  ]
})
export class ChatModule { }
