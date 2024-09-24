import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MaterialModule } from './material/material.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './services/auth.service';
import { NopagefoundComponent } from './nopagefound/nopagefound.component';
import { SuccessdialogComponent } from './shared/successdialog/successdialog.component';
import { InfoDialogComponent } from './shared/info-dialog/info-dialog.component';
import { AssignDriverComponent } from './shared/assign-driver/assign-driver.component';
import { FeedbackComponent } from './shared/feedback/feedback.component';
import { ReactiveFormsModule } from '@angular/forms';
import { StripeComponent } from './shared/stripe/stripe.component';
import { RidehistorydialogComponent } from './shared/ridehistorydialog/ridehistorydialog.component';
import { UtcToLocalTimePipe } from './services/utc-to-local-time.pipe';
import { TripEndComponent } from './shared/trip-end/trip-end.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { HttpErrorInterceptor } from './http-interceptor.interceptor';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';


const config: SocketIoConfig = { 
  url: 'http://localhost:4000', 
  options: {} 
};

@NgModule({
  declarations: [
    AppComponent,
    NopagefoundComponent,
    SuccessdialogComponent,
    InfoDialogComponent,
    AssignDriverComponent,
    FeedbackComponent,
    StripeComponent,
    RidehistorydialogComponent,
    UtcToLocalTimePipe,
    TripEndComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AuthModule,
    DashboardModule,
    MaterialModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    HttpClientModule,
    GoogleMapsModule,
    NgxPaginationModule,
    SocketIoModule.forRoot(config),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),

  ],
  providers: [
    provideAnimationsAsync(),
    {provide: HTTP_INTERCEPTORS, useClass:AuthInterceptor, multi:true},
    {provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true},
    AuthService,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
