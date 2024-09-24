import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  
  private serverUrl = environment.apiUrl; // Your backend URL

  constructor(private http: HttpClient) { }

  //-----------------------TO CHECK NOTIFICATION IS SUPPORTED OR NOT--------------------------------//
  checkNotificationSupport(): boolean {
    return 'Notification' in window;
  }

  //-----------------------TO TAKE PERMISSION FROM BROWSER LIKE CHROME--------------------------------//
  requestNotificationPermission(): Promise<NotificationPermission> {
    return Notification.requestPermission();
  }

  //-----------------------TO SHOW NOTIFICATION ON CLICK--------------------------------//
  showDummyNotification(data: any): void {
    console.log('Received push notification:', data);

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {

        const options: NotificationOptions = {
          body: data.message,
          icon: '../../assets/images/frontal-taxi-cab.png',
          // Add other notification options as needed
        };
        const notification = new Notification('Eber Ride', options);

      }
    }
  }


  // -----------------------PUSH NOTIFICATION PWS SERVICE_WORKER -------------------------------//
  requestPermission() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          throw new Error("Notification permission not granted")
        }
      });
    }
  }


}


