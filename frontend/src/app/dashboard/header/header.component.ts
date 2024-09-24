import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NotificationsService } from '../../services/notifications.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit, OnDestroy {

  notificationCounter = 0;
  private notifiedSubscription?: Subscription;
  title = 'frontend';
  isCollapsed = true;
  isMobile= true;
  
  @ViewChild(MatSidenav) sidenav!: MatSidenav;

  private subscriptions: Subscription = new Subscription();
  constructor(
    private notification : NotificationsService,
    private socket: SocketService,
    private router : Router,
    private observer: BreakpointObserver, 
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.notification.requestPermission();
    this.showDummyNotification();
    this.checkNotificationSupport();
    this.autoLogOut();
    

    this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
      if(screenSize.matches){
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
  }

  ngOnDestroy(): void {
    // this.subscriptions.unsubscribe();
    if (this.notifiedSubscription) {
      this.notifiedSubscription.unsubscribe();
  }
  }

  toggleMenu() {
    if(this.isMobile){
      this.sidenav.toggle();
      this.isCollapsed = false; // On mobile, the menu can never be collapsed
    } else {
      this.sidenav.open(); // On desktop/tablet, the menu can never be fully closed
      this.isCollapsed = !this.isCollapsed;
    }
  }

  autoLogOut(){
    // this.authService.autoLogout()
  };

  onLogout(){
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.toastr.info('Logged Out Successfully', 'Info');
    this.router.navigate(['/login']);
  }

    //---------------------TO CHECK NOTIFICATION--------------------------------//
    checkNotificationSupport(): void {
      const isSupported = this.notification.checkNotificationSupport();
      if (isSupported) {
        console.log('Notifications are supported in this browser.');
      } else {
        console.log('Notifications are not supported in this browser.');
      }
    }
  
  
    //-----------------------------------------TO SHOW NOTIFICATION ON CLICK----------------------------------------//
    showDummyNotification(): void {
      this.sendNotificationRequest()
      
      this.listenNotificationRequest()
    }
  

  
    //-------------------------------EMIT OR SEND NOTIFICATION REQUEST--------------------------//
    sendNotificationRequest(): void {
      this.notification.requestNotificationPermission().then((permission) => {

        if(permission === 'denied'){
          console.log("Notification is not enabled.")
        }

        if (permission === 'granted') {
          new Notification("Hello")
          this.socket.emitnotification();
        }
      });
    }
  
    //-------------------------------LISTEN OR RECEIVE NOTIFICATION REQUEST--------------------------//
    listenNotificationRequest(): void {
      if (this.notifiedSubscription) {
        this.notifiedSubscription.unsubscribe();
      }

      const notifiedSubscription =  this.socket.listeningnotification().subscribe((data: any) => {
  
        // this.subscriptions.add(notificationSubscription)
        
        this.notificationCounter = data.notificationCounter
      });

      this.subscriptions.add(notifiedSubscription)
    }

}
