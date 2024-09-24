import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({providedIn: 'root'})
export class SettingService{

    private serverUrl = environment.apiUrl;

    constructor(private http: HttpClient){};

    getsettingdata(): Observable<any>{
        return this.http.get<any>(`${this.serverUrl}/settingdata`)
    }

    updateSetting(formValues: any): Observable<any> {
        console.log(formValues)
        return this.http.post<any>(`${this.serverUrl}/updatesetting`, formValues)
    }

}