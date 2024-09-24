import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})

export class ConfirmrideService {

    private serverUrl = environment.apiUrl;

    constructor(private http: HttpClient){};

    getride(page: number, limit: number):Observable<any> {
        const params = {
            page: page,
            limit: limit,
        };
        return this.http.get(`${this.serverUrl}/ridedata`, { params: params })
    }

    getfilter(page: Number, limit: Number, search: String, statusfilter: Number, vehiclefilter: String, sortOrder: String): Observable<any> {
        return this.http.post(`${this.serverUrl}/ridesinfo`, { page, limit, search, statusfilter, vehiclefilter, sortOrder })
    }

    getMatchedDriverdata(data: any): Observable<any> {
        const url = `${this.serverUrl}/assigneddriverdata`;
        return this.http.post(url, data)
    }

}