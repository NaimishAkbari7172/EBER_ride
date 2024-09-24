import { NgModule } from "@angular/core";
import { ConfirmrideComponent } from "./confirmride.component";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { MatMenu } from "@angular/material/menu";
import { MaterialModule } from "../../material/material.module";


const routes: Routes= [
    {path: '', component: ConfirmrideComponent, pathMatch: "full"}
]

@NgModule({
    declarations: [
        ConfirmrideComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        NgxPaginationModule,
        MatMenu
    ]
})


export class ConfirmrideModule { }