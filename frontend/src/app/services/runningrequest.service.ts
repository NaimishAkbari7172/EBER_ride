import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RunningrequestService {

  private serverUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getsettingdata(): Observable<any>{
    return this.http.get<any>(`${this.serverUrl}/settingdata`)
}
}
