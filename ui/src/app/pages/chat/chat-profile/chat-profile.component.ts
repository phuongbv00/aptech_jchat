import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {AuthService} from '../../../shared/services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-chat-profile',
  templateUrl: './chat-profile.component.html',
  styleUrls: ['./chat-profile.component.scss']
})
export class ChatProfileComponent implements OnInit {
  @Output() openCreateDialog = new EventEmitter<any>();

  profile: any;

  constructor(private authService: AuthService,
              private router: Router) { }

  ngOnInit(): void {
    this.profile = this.authService.getCredentials();
  }

  logout(): void {
    this.authService.logout('email')
      .subscribe(() => {
        this.router.navigate(['/auth/login']);
      });
  }
}
