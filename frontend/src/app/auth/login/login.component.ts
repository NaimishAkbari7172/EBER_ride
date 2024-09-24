import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastrwrapperService } from '../../services/toastrwrapper.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(
    private _router: Router, 
    private formBuilder: FormBuilder, 
    private adminApi: ApiService, 
    private toastr1: ToastrwrapperService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get formControls() {
    return this.loginForm.controls;
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      this.adminApi.loginUser({ email, password }).subscribe({
        next: (res: any) => {
          console.log(res.jwtToken)
          this.authService.setToken(res.jwtToken);
          this.authService.initAutoLogout(); //start auto logout timer
          this.loginForm.reset();
          this.toastr1.showSuccess(res.message, 'Success');
          this._router.navigate(['/app']);
        },
        error: (error) => {
          console.log(error);
          // this.toastr.error(error.error.message);
        }
      });

    } else {
      console.log("all fields are required")
      this.toastr1.showWarning('All Fields are required.');
    }
  }


}
