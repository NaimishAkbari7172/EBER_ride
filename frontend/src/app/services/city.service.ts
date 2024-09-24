import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })

export class CityService {
    
    private serverUrl = environment.apiUrl;

    constructor(private http: HttpClient) { };

    getcountrydata(): Observable<any> {
        return this.http.get(`${this.serverUrl}/countrydata`)
    }

    addcity(city: any): Observable<any> {
        return this.http.post<any>(`${this.serverUrl}/city`, city)
    };

    getcity(page: number, limit: number): Observable<any> {
        const params = {
            page: page,
            limit: limit,
        };
        // console.log(params)
        return this.http.get(`${this.serverUrl}/city`, { params: params })
    };

    updateCity(cityId: string, city: any): Observable<any> {
        console.log(cityId)
        console.log(city)
        const url = `${this.serverUrl}/cityupdate/${cityId}`;
        return this.http.put<any>(url, city)
    }

    getCityPolygons(countryid: any): Observable<any> {
        // console.log(countryid)
        return this.http.get<any>(`${this.serverUrl}/coordinates/${countryid}`)
    }

}