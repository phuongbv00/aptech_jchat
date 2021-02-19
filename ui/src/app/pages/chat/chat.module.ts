import { ChatComponent } from './chat.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { FormsModule } from '@angular/forms';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatFormComponent } from './chat-form/chat-form.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { NbSidebarModule, NbLayoutModule, NbInputModule, NbButtonModule, NbIconModule, NbListModule, NbBadgeModule } from '@nebular/theme';
import { ChatProfileComponent } from './chat-profile/chat-profile.component';


@NgModule({
  declarations: [ChatComponent, ChatListComponent, ChatFormComponent, ChatBoxComponent, ChatProfileComponent],
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
  ]
})
export class ChatModule { }
