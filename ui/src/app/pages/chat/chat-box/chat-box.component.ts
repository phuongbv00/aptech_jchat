import { ChatMessage } from '../../../shared/models/chat-message.model';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit
} from '@angular/core';
import {AuthService} from '../../../shared/services/auth.service';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit, AfterViewChecked {
  @Input() messages: ChatMessage[];

  isScrolling = false;

  constructor(private authService: AuthService,
              private element: ElementRef) { }

  @HostListener('scroll')
  onScrolling(): void {
    this.isScrolling = true;
    if (this.element.nativeElement.scrollTop === 0) {
      console.log('load more!');
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    if (!this.isScrolling) {
      this.element.nativeElement.scrollTo(0, this.element.nativeElement.scrollHeight);
    } else {
      this.isScrolling = false;
    }
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
