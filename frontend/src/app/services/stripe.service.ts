import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: "root"
})

export class StripeService {

    private serverUrl = environment.apiUrl;
    
    constructor(private http: HttpClient) { }

    makepayment(stripeToken: any): Observable<any> {
        return this.http.post<any>(`${this.serverUrl}/checkout`, { token: stripeToken })
    }

    getcard(id: any) {
        // console.log(id);
        return this.http.get(`${this.serverUrl}/getcard/` + id)
    }

    deletecard(id: any) {
        return this.http.delete(`${this.serverUrl}/deletecard/` + id)
    }


    processPayment(userId: string, amount: number): Observable<any> {
        console.log(userId ,amount + "1 :::::::::")
        return this.http.post<any>(`${this.serverUrl}/payment/${userId}`, { amount });
    }
}