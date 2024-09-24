import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private serverUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    private getSessionHeaders(): HttpHeaders {
        const sessionToken = sessionStorage.getItem('token');

        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `${sessionToken}`,
        });
    }


    registerUser(userData: any): Observable<any> {
        // console.log(userData);
        return this.http.post<any>(`${this.serverUrl}/register`, userData)
    }

    getuserData(): Observable<any> {
        const headers = this.getSessionHeaders();
        return this.http.get<any>(`${this.serverUrl}/fetch`, { headers })
    }

    loginUser(loginData: any): Observable<any> {
        return this.http.post<any>(`${this.serverUrl}/login`, loginData)
    }

    deleteUser(userId: string): Observable<any> {
        const url = `${this.serverUrl}/logindata/${userId}`;
        const headers = this.getSessionHeaders();
        return this.http.delete<any>(url, { headers })
    }

    updateUser(userId: string, userData: any): Observable<any> {
        const url = `${this.serverUrl}/update/${userId}`;
        const headers = this.getSessionHeaders();
        return this.http.put<any>(url, userData, { headers }) 
    }
}