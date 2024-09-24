import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { MenuComponent } from './dashboard/menu/menu.component';
import { authGuard } from './services/auth.guard';
import { NopagefoundComponent } from './nopagefound/nopagefound.component';
import { CommonModule } from '@angular/common';
import { SigninComponent } from './auth/signin/signin.component';
import { ForgotpasswordComponent } from './auth/forgotpassword/forgotpassword.component';

const routes: Routes = [
  {path:'',redirectTo:'login', pathMatch: 'full'},
  {path:'login', component: LoginComponent},
  {path:'signin', component: SigninComponent},
  {path:'forgot', component: ForgotpasswordComponent},
  { 
    path:'app', 
    component: MenuComponent,
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadChildren:()=>import('./dashboard/dashboard.module').then(m=>m.DashboardModule) },
    ]
  },  
  {path:'**', component: NopagefoundComponent}, 

  
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
