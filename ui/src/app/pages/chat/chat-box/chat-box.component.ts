import { ChatMessage } from '../../../shared/models/chat-message.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit {
  @Input() messages: ChatMessage[];

  constructor() { }

  ngOnInit(): void {
  }

}
