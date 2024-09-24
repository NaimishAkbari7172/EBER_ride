import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })

export class CountryService {

    private serverUrl = environment.apiUrl;

    private countryAPI = environment.countryApi;

    constructor(
        private http: HttpClient,
    ) { }

    fetchCountryAPI(): Observable<any> {
        return this.http.get(`${this.countryAPI}`)
    };

    addCountry(countryData: any): Observable<any> {
        return this.http.post(`${this.serverUrl}/country`, countryData)
    };

    getCountryData(): Observable<any> {
        return this.http.get(`${this.serverUrl}/countrydata`)
    }

    searchCountry(search: string): Observable<any> {
        const params = {
            search: search,
        };
        return this.http.get(`${this.serverUrl}/countrysearch/`, { params: params })
    }
}