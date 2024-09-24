import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CityComponent } from './city.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatIcon } from '@angular/material/icon';



const routes: Routes = [{ path: "", component: CityComponent, pathMatch: "full" }]

@NgModule({
    declarations: [CityComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        // GoogleMapsModule,
        NgxPaginationModule,
        MatIcon
    ]
})
export class CityModule { }
