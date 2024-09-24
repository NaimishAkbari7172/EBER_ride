import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
            { path: 'home', component: HomeComponent},
            { path: 'createride', loadChildren:()=>import('./createride/createride.module').then(m=>m.CreaterideModule)  },
            { path: 'confirmride', loadChildren:()=>import('./confirmride/confirmride.module').then(m=>m.ConfirmrideModule) },
            { path: 'ridehistory', loadChildren:()=>import('./ridehistory/ridehistory.module').then(m=>m.RidehistoryModule)},
            { path: 'user', loadChildren:()=>import('./user/user.module').then(m=>m.UserModule)},
            { path: 'admin', loadChildren:()=>import('./admin/admin.module').then(m=>m.AdminModule) },
            { path: 'driver',loadChildren:()=>import('./driverlist/driverlist.module').then(m=>m.DriverlistModule)},
            { path: 'runningrequest',loadChildren:()=>import('./runningrequest/runningrequest.module').then(m=>m.RunningrequestModule)},
            { path: 'country', loadChildren:()=>import('./country/country.module').then(m=>m.CountryModule)} ,
            { path: 'city', loadChildren:()=>import('./city/city.module').then(m=>m.CityModule)},
            { path: 'vehicletype',loadChildren:()=>import('./vehicle/vehicle.module').then(m=>m.VehicleModule)},
            { path: 'pricing', loadChildren:()=>import('./pricing/pricing.module').then(m=>m.PricingModule) },
            { path: 'setting', loadChildren:()=>import('./settings/settings.module').then(m=>m.SettingsModule) },
];

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
