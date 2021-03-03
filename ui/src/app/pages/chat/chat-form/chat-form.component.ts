import { EventConstant } from './../../../shared/constants/event.constant';
import {Component, Input, OnInit, TemplateRef} from '@angular/core';
import {NbDialogRef, NbDialogService} from '@nebular/theme';
import {ChatService} from '../../../shared/services/chat.service';
import {FileService} from '../../../shared/services/file.service';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.scss']
})
export class ChatFormComponent implements OnInit {
  @Input() topicId: string;

  textMessage: string;
  imageSrc: string;

  imagePickerRef: NbDialogRef<any>;

  constructor(private dialogService: NbDialogService,
              private chatService: ChatService) { }

  ngOnInit(): void {
  }

  onSent(): void {
    if (!this.textMessage) {
      return;
    }
    this.chatService.send({
      event: EventConstant.SEND_TEXT_CHAT,
      data: new Map([
        ['topicId', this.topicId],
        ['text', this.textMessage],
      ]),
    });
    this.textMessage = '';
  }

  openImagePicker(imagePicker: TemplateRef<any>): void {
    this.imagePickerRef = this.dialogService.open(imagePicker);
  }

  sendImageMessage(): void {
    if (!this.imageSrc) {
      return;
    }
    this.chatService.send({
      event: EventConstant.SEND_TEXT_CHAT,
      data: new Map([
        ['topicId', this.topicId],
        ['image', this.imageSrc],
      ]),
    });
    this.imageSrc = '';
    this.imagePickerRef.close();
  }
}
