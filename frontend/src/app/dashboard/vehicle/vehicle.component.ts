import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ToastrwrapperService } from '../../services/toastrwrapper.service';
import { VehicleService } from '../../services/vehicle.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.css'
})
export class VehicleComponent implements OnInit {
  vehicleForm!: FormGroup;
  AddbuttonForm: boolean = false;
  updateButtonForm: boolean = false;
  vehiclesData: any;
  file: any;
  selectedVehicle: any;
  id: any;
  isUpdate: boolean=false

  constructor(
    private formbuilder: FormBuilder,
    private vehicleService: VehicleService,
    private toastr: ToastrService,
    private toastr1: ToastrwrapperService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.vehicleForm = this.formbuilder.group({
      vehicleName: ["", [Validators.required]],
      vehicleImage: [""]
    });
  
    this.vehicleService.getvehicle().subscribe({
      next: (response: any) => {
        this.vehiclesData = response.data.map((vehicle: any) => ({
          _id: vehicle._id,
          vehicleName: vehicle.vehicleName,
          vehicleImage: vehicle.vehicleImage,
        }));
        console.log(this.vehiclesData)
      },
      error: (err) => {
        console.log(err)
        // this.toastr.error(err)
      },
    });
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }

  addVehicle() {
    const formData = new FormData();
    formData.append("vehicleImage", this.file);
    formData.append("vehicleName", this.vehicleForm.value.vehicleName);
    console.log(formData)
    if (this.vehicleForm.valid) {
        this.vehicleService.registerVehicle(formData).subscribe({
          next: (res) => {
            this.vehiclesData.push(res.vehicle);
            this.vehicleForm.reset();
            this.AddbuttonForm = false;
            this.toastr1.showSuccess(res.message);
          },
          error: (error) => {
            console.log(error);
            // this.toastr.warning(error);
          }
        });
    } 
    else {
      this.toastr1.showWarning("Please Fill Valid Details");
    }
  }

  updateVehicle(){
    const formData = new FormData();
    formData.append("vehicleImage", this.file);
    formData.append("vehicleName", this.vehicleForm.value.vehicleName);
    const vehicleData = this.vehicleForm.value;
    console.log(vehicleData)

    this.vehicleService.updateVehicle(this.id, formData).subscribe({
    next: (res) => {
        let vehicle = res.vehicle
        this.vehicleForm.reset()
        this.updateButtonForm = false
        console.log(this.vehiclesData)
        this.file = null
        this.toastr1.showSuccess(res.message);

        
        let findobj = this.vehiclesData.find((obj: any) => {
          console.log("obj= " ,obj)
          return obj._id === vehicle._id;
        });
        console.log(findobj)
        let key = Object.keys(findobj);

        key.forEach((key: any) => {
          findobj[key] = vehicle[key];
        });

      // this.ngOnInit()
    },
    error: (error:any) => {
      console.log(error);
      // this.toastr.warning(error);
      
    }
      });
    this.selectedVehicle = null;
  }

  editVehicle(vehicle: any) {
    console.log('vehicle added.......................')
    this.id = vehicle._id;
    this.isUpdate= true
    this.selectedVehicle = vehicle;
    // console.log(this.id)
    // console.log(vehicle.vehicleName)
    this.vehicleForm.patchValue({
      vehicleName: vehicle.vehicleName,
    });
    this.updateButtonForm = true;
    this.AddbuttonForm = false;
  }

  toggleAddFormVisibility() {
    this.AddbuttonForm = !this.AddbuttonForm;
    this.selectedVehicle = null;
    this.vehicleForm.reset();
    this.updateButtonForm = false
  }

  togglecancelFormVisibility(){
    this.updateButtonForm = false;
    this.AddbuttonForm= false;
  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}

