import { EventConstant } from './../../../shared/constants/event.constant';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WebsocketMessage } from 'src/app/shared/dto/websocket-message.dto';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.scss']
})
export class ChatFormComponent implements OnInit {
  @Output() sendMessage = new EventEmitter<WebsocketMessage>();
  @Input() topicId: string;

  textMessage: string;

  constructor() { }

  ngOnInit(): void {
  }

  onSent(): void {
    if (!this.textMessage) {
      return;
    }
    this.sendMessage.emit({
      event: EventConstant.SEND_TEXT_CHAT,
      data: new Map([
        ['topicId', this.topicId],
        ['text', this.textMessage],
      ]),
    });
    this.textMessage = '';
  }
}
