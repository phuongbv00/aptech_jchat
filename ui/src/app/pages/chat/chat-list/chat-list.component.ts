import { ChatTopic } from '../../../shared/models/chat-topic.model';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit {
  @Input() topics: ChatTopic[];
  @Input()topicSelected: ChatTopic;

  @Output() topicSelect = new EventEmitter<ChatTopic>();

  constructor() { }

  ngOnInit(): void {
  }

  onTopicSelected(topic: ChatTopic): void {
    this.topicSelected = topic;
    this.topicSelect.emit(topic);
  }
}
