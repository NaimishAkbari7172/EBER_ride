import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })

export class VehicleService {
    
    private serverUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    registerVehicle(vehicleData: FormData): Observable<any> {
        return this.http.post(`${this.serverUrl}/vehicle`, vehicleData)
    }

    getvehicle(): Observable<any> {
        return this.http.get(`${this.serverUrl}/vehicledata`)
    }

    updateVehicle(vehicleId: string, vehicleData: any): Observable<any> {
        console.log(vehicleId);
        console.log(vehicleData);
        const url = `${this.serverUrl}/updateVehicle/${vehicleId}`;
        return this.http.put<any>(url, vehicleData)
    }
}