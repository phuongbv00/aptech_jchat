import { EventConstant } from './../../../shared/constants/event.constant';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WebsocketMessage } from 'src/app/shared/dto/websocket-message.dto';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.scss']
})
export class ChatFormComponent implements OnInit {
  message: WebsocketMessage = {
    text: '',
    event: EventConstant.SEND_TEXT_CHAT,
    to: '',
    from: 'me',
  };

  @Output() sendMessage = new EventEmitter<WebsocketMessage>();
  @Input() to: string;

  constructor() { }

  ngOnInit(): void {
  }

  onSent(): void {
    if (!this.message.text) {
      return;
    }
    this.message.to = this.to;
    this.sendMessage.emit(this.message);
    this.message.text = '';
  }
}
