import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SigninComponent } from './signin/signin.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { NopagefoundComponent } from '../nopagefound/nopagefound.component';


const routes: Routes = [
    {path: 'login', component: LoginComponent },
    {path: 'signin', component: SigninComponent },
    {path: 'forgot', component: ForgotpasswordComponent},
    // {path: '**', component:NopagefoundComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AuthRoutingModule { }

