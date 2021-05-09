import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {AuthService} from '../../../shared/services/auth.service';
import {Router} from '@angular/router';
import {HttpClient, HttpParams} from '@angular/common/http';
import {User} from '../../../shared/models/user.model';
import {environment} from '../../../../environments/environment';
import {NbDialogService, NbToastrService} from '@nebular/theme';
import {FileService} from '../../../shared/services/file.service';

@Component({
  selector: 'app-chat-profile',
  templateUrl: './chat-profile.component.html',
  styleUrls: ['./chat-profile.component.scss']
})
export class ChatProfileComponent implements OnInit {
  @Output() openCreateDialog = new EventEmitter<any>();

  profile: any;

  constructor(private authService: AuthService,
              private router: Router,
              private http: HttpClient,
              public dialogService: NbDialogService,
              private toastrService: NbToastrService,
              private fileService: FileService) { }

  ngOnInit(): void {
    this.profile = this.authService.getCredentials();
  }

  logout(): void {
    this.authService.logout('email')
      .subscribe(() => {
        this.router.navigate(['/auth/login']);
      });
  }

  updateAvatar(file: File): void {
    this.fileService.upload(file)
      .subscribe(avatar => {
        const params = new HttpParams()
          .set('id', this.profile.id)
          .set('avatar', avatar);
        this.http.put<User>(`${environment.apiEndpoint}/auth/avatar`, null, {params})
          .subscribe(
            res => {
              this.profile.avatar = res.avatar;
              this.authService.saveCredentials(this.profile);
              this.toastrService.success('Update avatar successfully', 'Update profile');
            },
            error => this.toastrService.danger('Somethings went wrong', 'Update avatar'));
      }, error => this.toastrService.danger('Somethings went wrong', 'Update avatar'));
  }

  updateProfile(): void {
    const params = new HttpParams()
      .set('id', this.profile.id)
      .set('fullName', this.profile.fullName);
    this.http.put<User>(`${environment.apiEndpoint}/auth/profile`, null, {params})
      .subscribe(
        res => {
          this.profile.fullName = res.fullName;
          this.authService.saveCredentials(this.profile);
          this.toastrService.success('Update profile successfully', 'Update profile');
        },
        error => this.toastrService.danger('Somethings went wrong', 'Update profile'));
  }
}
