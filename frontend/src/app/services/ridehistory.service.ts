import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RidehistoryService {
  
  private serverUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  downlaodallData(alldataatonce: any): Observable<any>{
    console.log(JSON.stringify(alldataatonce)+ "64555555555555555555555555555555");
    
    return this.http.post(`${this.serverUrl}/downloadridehistory`,{alldataatonce})
  }

}
