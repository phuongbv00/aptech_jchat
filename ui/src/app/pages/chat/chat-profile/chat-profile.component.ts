import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {AuthService} from '../../../shared/services/auth.service';

@Component({
  selector: 'app-chat-profile',
  templateUrl: './chat-profile.component.html',
  styleUrls: ['./chat-profile.component.scss']
})
export class ChatProfileComponent implements OnInit {
  @Output() openCreateDialog = new EventEmitter<any>();

  profile: any;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.profile = this.authService.getCredentials();
  }

}
