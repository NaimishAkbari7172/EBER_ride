import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class PricingService {

    private serverUrl = environment.apiUrl;
    
    constructor(private http: HttpClient) { }

    getCountryData(): Observable<any> {
        return this.http.get(`${this.serverUrl}/countrydata`)
    }

    getCityData(): Observable<any> {
        const params = {
            page: 1,
            limit: 100,
        };
        return this.http.get(`${this.serverUrl}/city`,{ params: params })
    }

    getServiceData(): Observable<any> {
    
            return this.http.get(`${this.serverUrl}/vehicledata`)
        }
    

    addPricing(pricingdata: any): Observable<any> {
        // console.log(pricingdata)
        return this.http.post<any>(`${this.serverUrl}/pricing`, pricingdata)
    }

    getPricingData(page: number, limit: number): Observable<any> {
        const params = {
            page: page,
            limit: limit
        }
        return this.http.get(`${this.serverUrl}/pricingdata`, {params: params})
    }

    deleteValues(id: any): Observable<any> {
        return this.http.delete(`${this.serverUrl}/deletepricing/${id}`)
    }

    UpdatePricing(id: any, data: any): Observable<any> {
        return this.http.put(`${this.serverUrl}/updatepricing/${id}`, data)
    }


}