import { Injectable } from '@angular/core';
import {NbAuthResult, NbAuthService} from '@nebular/auth';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends NbAuthService{
  saveCredentials(cre: any): void {
    localStorage.setItem('credentials', JSON.stringify(cre));
  }

  getCredentials(): any {
    return JSON.parse(localStorage.getItem('credentials'));
  }

  logout(strategyName: string): Observable<NbAuthResult> {
    return super.logout(strategyName)
      .pipe(
        tap(() => localStorage.removeItem('credentials'))
      );
  }
}
