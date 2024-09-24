import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UsersService {

    private serverUrl = environment.apiUrl;

    private countryAPI = 'https://restcountries.com/v3.1/all'


    constructor(private http: HttpClient) { }

    getcode(): Observable<any> {
        return this.http.get(`${this.serverUrl}/countrydata`)
    }

    addUser(userData: any): Observable<any> {

        return this.http.post<any>(`${this.serverUrl}/user`, userData)
    }


    deleteUser(userId: string): Observable<any> {
        const url = `${this.serverUrl}/userdelete/${userId}`;
        return this.http.delete<any>(url)
    }

    updateUser(userId: string, userData: any): Observable<any> {
        console.log(userData)
        const url = `${this.serverUrl}/userupdate/${userId}`;
        return this.http.put<any>(url, userData)
    }

    getUsers(search: string, page: number, limit: number, sortBy: string, sortOrder: string): Observable<any> {
        const params = {
            search: search,
            page: page.toString(),
            limit: limit.toString(),
            sortBy: sortBy,
            sortOrder: sortOrder
        };
        const url = `${this.serverUrl}/userdata`;
        return this.http.get(url, { params: params })
    }

}
