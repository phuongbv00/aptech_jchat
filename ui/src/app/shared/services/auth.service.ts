import { Injectable } from '@angular/core';
import {NbAuthService} from '@nebular/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends NbAuthService{
  saveCredentials(cre: any): void {
    sessionStorage.setItem('credentials', JSON.stringify(cre));
  }

  getCredentials(): any {
    return JSON.parse(sessionStorage.getItem('credentials'));
  }
}
