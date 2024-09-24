import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastrwrapperService } from '../../services/toastrwrapper.service';


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  myForm!: FormGroup;

  constructor(
    private formbuilder: FormBuilder, 
    private adminApi: ApiService, 
    private _router : Router, 
    private toastr1: ToastrwrapperService
  ) {}



  ngOnInit(): void {
    this.myForm = this.formbuilder.group({
      adminName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      cnfpassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }


  submitForm() {
    if (this.myForm.valid) {
      const personData = this.myForm.value;
      console.log(personData)
      this.adminApi.registerUser(personData).subscribe({
      next:  (res) => {
        this.myForm.reset();
        this.toastr1.showSuccess(res.message);
        this._router.navigate(['/login'])
      },
      error: (error) => {
        console.log(error);
        // this.toastr.error(error.error.message);
      }
    })
    }
    else{
      this.toastr1.showWarning('All Fields are Required');
    }
  }
  

}
