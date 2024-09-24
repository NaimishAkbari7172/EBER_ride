import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class DriverService {

    private serverUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }
    getcode(): Observable<any> {
        return this.http.get(`${this.serverUrl}/countrydata`)
    }


    getCityData(): Observable<any> {
        const params = {
            page: 15,
            limit: 100
        };
        return this.http.get(`${this.serverUrl}/city`, {params: params})
    }

    getVehicleData(): Observable<any> {
        return this.http.get(`${this.serverUrl}/vehicledata`)
    }

    addDriver(driverData: any): Observable<any> {
        // console.log(driverData);
        return this.http.post<any>(`${this.serverUrl}/adddriver`, driverData)
    }

    getDriver(search: string, page: number, limit: number, sortBy: string, sortOrder: string): Observable<any> {
        const params = {
            search: search,
            page: page,
            limit: limit,
            sortBy: sortBy,
            sortOrder: sortOrder
        };
        // console.log(params)
        const url = `${this.serverUrl}/driverdata`;
        return this.http.get(url, { params: params })
    }
    getDriverdata(): Observable<any> {
        const url = `${this.serverUrl}/driverdata`;
        return this.http.get(url)
    }

    deleteDriver(driverId: string): Observable<any> {
        console.log('delete')
        const url = `${this.serverUrl}/driverdata/${driverId}`;
        return this.http.delete<any>(url)
    }

    updateDriver(driverId: string, userData: any): Observable<any> {
        // console.log(userData)
        const url = `${this.serverUrl}/updatedriver/${driverId}`;
        return this.http.put<any>(url, userData)
    }

    updateService(driverId: string, servicename: any): Observable<any> {
        const url = `${this.serverUrl}/service/${driverId}`;
        return this.http.post<any>(url, {"servicetype": servicename})
    }



}