import { Injectable } from '@angular/core';
import {HttpClient, HttpEvent, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) { }

  upload(file: File): Observable<string> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.http.post<{file}>(`${environment.apiEndpoint}/file/upload`, formData)
      .pipe(
        map(res => `${environment.apiEndpoint}/file/${res.file}`)
      );
  }
}
