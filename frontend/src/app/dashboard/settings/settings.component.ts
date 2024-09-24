import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrwrapperService } from '../../services/toastrwrapper.service';
import { SettingService } from '../../services/setting.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  settingForm!: FormGroup;
  id: any;
  settingdata: any;
  timeoutArray: number[] = [10, 20, 30, 45, 60, 90, 120];
  stopArray: number[] = [1, 2, 3, 4, 5];
  rideTimeouts: number;
  stopCounts: number;
  selectedtimeout: number;
  selectedstop: number

  credentials: any[] = [];
  EMAIL_PASSWORD: any;
  EMAIL_USER: any;
  accountSid: any;
  authToken: any;
  twilioPhoneNumber: any;
  STRIPE_Publishable_key: any;
  STRIPE_Secret_key: any;

  constructor(
    private settingservice: SettingService,
    private toastr1: ToastrwrapperService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initializeForm();

    this.getsettingData()
  }

    //----------------------initializeForm DATA----------------------//
    initializeForm(): void {
      this.settingForm = this.formBuilder.group({
        rideTimeouts: ["", [Validators.required]],
        stopCounts: ["", [Validators.required]],
        EMAIL_USER: ["", [Validators.required]],
        EMAIL_PASSWORD: ["", [Validators.required]],
        accountSid: ["", [Validators.required]],
        authToken: ["", [Validators.required]],
        twilioPhoneNumber: ["", [Validators.required]],
        STRIPE_Publishable_key: ["", [Validators.required]],
        STRIPE_Secret_key: ["", [Validators.required]],
      });
    }

  //---------------------GET SETTING DATA----------------------//

  getsettingData() {
    this.settingservice.getsettingdata().subscribe({
        next: (data) => {
          if (data) {
            this.settingForm.patchValue({
              rideTimeouts: data.ridetimeout,
              stopCounts: data.stopCount,
              EMAIL_USER: data.EMAIL_USER,
              EMAIL_PASSWORD: data.EMAIL_PASSWORD,
              accountSid: data.accountSid,
              authToken: data.authToken,
              twilioPhoneNumber: data.twilioPhoneNumber,
              STRIPE_Publishable_key: data.STRIPE_Publishable_key,
              STRIPE_Secret_key: data.STRIPE_Secret_key,
            });
          }
          console.log(data)
        },
        error: (err: any) => {
          console.log(err)
          // this.toastr.error(err)
        }
      })
  }

  //---------------------UPDATE SETTING DATA----------------------//
  onSubmit() {
    console.log(this.settingForm.value)
    const formData = {
      settingdata: this.settingForm.value, 
      id:this.id
    };

    if(this.settingForm.valid){
      
      this.settingservice.updateSetting(formData).subscribe({
        next: (response: any) => {
          console.log(response);

          this.settingdata = response
          this.toastr1.showSuccess(response.message);
          this.getsettingData()
        },  
        error: (error: any) => {
          console.log(error);
          // this.toastr.error(error.error.message);
        },
      });
    }else{
      this.toastr1.showWarning("All Fields Required");
      console.log("All Fields Required");
    }
  }



  //-------------------------------EXTRA COMMON CODE------------------------------------//
  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}
