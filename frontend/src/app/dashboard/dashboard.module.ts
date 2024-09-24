import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuComponent } from './menu/menu.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

import { MaterialModule } from '../material/material.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard-routing.module';


import { HomeModule } from './home/home.module';
import { CreaterideModule } from './createride/createride.module';
import { ConfirmrideModule } from './confirmride/confirmride.module';
import { RidehistoryModule } from './ridehistory/ridehistory.module';
// import { RidehistoryModule } from './ridehistory/ridehistory.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { RunningrequestModule } from './runningrequest/runningrequest.module';
import { CountryModule } from './country/country.module';
import { CityModule } from './city/city.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { DriverlistModule } from './driverlist/driverlist.module';
import { PricingModule } from './pricing/pricing.module';
import { SettingsModule } from './settings/settings.module';




@NgModule({
  declarations: [
    MenuComponent,
    HeaderComponent,
    FooterComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    HomeModule,
    CreaterideModule,
    ConfirmrideModule,
    RidehistoryModule,
    UserModule,
    AdminModule,
    DriverlistModule,
    RunningrequestModule,
    CountryModule,
    CityModule,
    VehicleModule,
    PricingModule,
    SettingsModule,
  ],
  exports: [
    // HeaderComponent,
    // FooterComponent
  ]
})
export class DashboardModule { }
