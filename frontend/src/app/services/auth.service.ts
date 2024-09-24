import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private logoutTimer: any;

    private inactivityTimeout: any;
    private tokenExpirationTimer: any;

    constructor(private router: Router) {
        this.initListener();
    }

    setToken(token: string) {
        localStorage.setItem('token', token);
        // const payload = JSON.parse(atob(token.split('.')[1]));
        // const ExpTime = payload.exp * 1000; 
        // const currentTime = Date.now();
        // const remainingTime = ExpTime - currentTime
        // console.log(remainingTime/60000)

        // Set auto logout
        // this.autoLogout(20 * 60 * 1000); // 20 minutes
        // this.autoLogout(remainingTime); // 20 minutes
    }

    // Initialize auto-logout after login
    initAutoLogout() {
        const expiration = this.getTokenExpiration();
        if (expiration) {
            const timeout = expiration - Date.now();
            this.setAutoLogout(timeout);
        }
    }

    getTokenExpiration(): number | null {
        const token = this.getToken();
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.exp * 1000; // Convert to milliseconds
        }
        return null;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }


    // Set auto-logout timeout
    private setAutoLogout(timeout: number) {
        this.logoutTimer = setTimeout(() => {
            this.logout();
        }, timeout);
    }


    autoLogout(expirationDuration: number) {
        // console.log('Setting autoLogout with duration:', expirationDuration);

        if(this.tokenExpirationTimer){
            // console.log('Clearing existing timeout');
            clearTimeout(this.tokenExpirationTimer);
        }

        this.tokenExpirationTimer = setTimeout(() => {
          this.logout();
        }, expirationDuration);
    }


    logout(): void {
        console.log('Logging out...');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        clearTimeout(this.logoutTimer);
        // if (this.tokenExpirationTimer) {
        //     clearTimeout(this.tokenExpirationTimer);
        // }
        this.router.navigate(['/login']);
    }


    startInactivityTimer(): void {
        this.inactivityTimeout = setTimeout(() => {
            this.logout();
        }, 20 * 60 * 1000); // 20 minutes in milliseconds
    }

    resetInactivityTimer(): void {
        clearTimeout(this.inactivityTimeout);
        this.startInactivityTimer();
    }

    initListener(): void {
        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        events.forEach(event => {
            window.addEventListener(event, () => this.resetInactivityTimer());
        });
    }

    // Check if token is expired
    isTokenExpired(): boolean {
        const expiration = this.getTokenExpiration();
        return expiration ? Date.now() > expiration : true;
    }

    isLoggedIn(): boolean {
        return !this.isTokenExpired()
        return !!localStorage.getItem('token') || !!sessionStorage.getItem('token');
    }

    deleteToken(): void {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
    }

}
