import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverlistComponent } from './driverlist.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [{ path: "", component: DriverlistComponent, pathMatch: "full" }]


@NgModule({
    declarations: [DriverlistComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule
    ]
})
export class DriverlistModule { }
