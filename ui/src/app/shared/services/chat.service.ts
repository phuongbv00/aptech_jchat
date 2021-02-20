import { Injectable } from '@angular/core';
import {RxStompService} from '@stomp/ng2-stompjs';
import {WebsocketMessage} from '../dto/websocket-message.dto';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private rxStompService: RxStompService) { }

  send(mess: WebsocketMessage): void {
    this.rxStompService.publish({
      destination: '/app/index',
      headers: {
        token: JSON.parse(localStorage.getItem('auth_app_token'))?.value,
      },
      body: JSON.stringify(mess),
    });
  }
}
