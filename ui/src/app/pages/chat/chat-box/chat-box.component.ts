import { ChatMessage } from '../../../shared/models/chat-message.model';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import {AuthService} from '../../../shared/services/auth.service';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit, AfterViewChecked {
  @Input() messages: ChatMessage[];

  constructor(private authService: AuthService,
              private element: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    this.element.nativeElement.scrollTo(0, this.element.nativeElement.scrollHeight);
  }

  isMyChat(mess: ChatMessage): boolean {
    return mess.createdBy.id === this.authService.getCredentials().id;
  }

  isFirstMessageInAnUserBatch(mess: ChatMessage, index: number): boolean {
    if (index === 0) { return true; }
    return this.messages[index - 1].createdBy.id !== mess.createdBy.id;
  }

  isLastMessageInAnUserBatch(mess: ChatMessage, index: number): boolean {
    if (index === this.messages.length - 1) { return true; }
    return this.messages[index + 1].createdBy.id !== mess.createdBy.id;
  }
}
