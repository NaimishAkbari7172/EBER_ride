import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DriverService } from '../../services/driver.service';
import { ToastrwrapperService } from '../../services/toastrwrapper.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-driverlist',
  templateUrl: './driverlist.component.html',
  styleUrl: './driverlist.component.css'
})
export class DriverlistComponent {
  driverForm!: FormGroup;
  driverFormButton: boolean = false;
  selectedcountrycode: any;
  countrycodeArray: any[] = [];
  isEditMode: boolean = false;
  citiesname: any[] = [];
  selectedCity: any;
  file: any;
  driverArray: any[] = [];
  limit: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;
  paginatedDrivers: any[] = [];
  id: any;
  search: string = '';
  serviceModal: boolean = false;
  vehiclesData: any[]= [];
  serviceForm!: FormGroup;
  selectedVehicle: any;
  count: any;
  selectedSortBy: string = 'name';
  selectedSortOrder: string = '';
  preSelected: string = "+91";
  imageUrl: string | ArrayBuffer | null = null;

  private subscriptions: Subscription = new Subscription();
  constructor(
    private driverservice: DriverService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private socket: SocketService,
    private toastr1: ToastrwrapperService,
  ) { }

  ngOnInit(): void {

    this.getcountryCode();
    this.getCityNamefromDB()
    this.getDriverData()
    this.getVehicleNamefromDB()
    this.getDriverStatus()
    this.getDriverService()


    this.driverForm = this.formBuilder.group({
      profile: [""],
      drivername: ["", [Validators.required]],
      driveremail: ["", [Validators.required, Validators.email]],
      countrycode: ["+91", [Validators.required]],
      driverphone: ["", [Validators.required, Validators.minLength(10)]],
      city: ["", [Validators.required]],
      status: [""],
    });

    this.serviceForm = this.formBuilder.group({
      servicetype: ['']
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }



  // -----------------------GET COUNTRY CODE---------------------------
  getcountryCode() {
    this.driverservice.getcode().subscribe({
      next: (response) => {
        // console.log(response)
        response.countrydata.forEach((element: any) => {
          this.countrycodeArray.push(element.countryCode)

        });
        this.countrycodeArray.sort();
      },
      error: (error: any) => {
        console.log(error)
        // this.toastr.error(error);
      },
    });
  }

  onSelectedCode(value: any) {
    this.selectedcountrycode = value;
    
    // console.log(value)
  }


  // -----------------------GET CITY OPTION---------------------------
  getCityNamefromDB(): void {
    this.driverservice.getCityData().subscribe({
      next: (response) => {
        this.citiesname = response.citydata;
        console.log(this.citiesname)
      },
      error: (error) => {
        console.log(error)
        // this.toastr.error(error.error.message);
      }
    });
  }

  onSelectedCity(value: any) {
    this.selectedCity = value;
    console.log(value)
  }

  // -----------------------DRIVER PROFILE---------------------------
  onFileSelected(event: any) {
    this.file = event.target.files[0];
    if (this.file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(this.file);
    }
    console.log(this.file);
  }

  // -------------------------------------------------NG SUBMIT FXN---------------------------------------------------------
  onSubmit() {
    
    if (this.isEditMode) {
      this.updateDriver();
    } else {
      this.AddDriver();
    }
  }

  // --------------------------------------------ADD DRIVER FXN---------------------------------------------
  AddDriver() {
    // using object but image not uploading
  
    const formValues = this.driverForm.value;
    console.log(formValues);

    // using formdata for image uploading
    var formData = new FormData();
    formData.append("drivername", this.driverForm.value.drivername);
    formData.append("driveremail", this.driverForm.value.driveremail);
    formData.append("countrycode", this.selectedcountrycode);
    formData.append("driverphone", this.driverForm.value.driverphone);
    formData.append("city", this.selectedCity);
    formData.append("profile", this.file);

    console.log(formData)

  


    if (this.driverForm.valid) {
      this.driverservice.addDriver(formData).subscribe({
        next: (response: any) => {
          console.log(response);
          this.getDriverData();
          this.driverForm.reset();
          this.driverFormButton = false;
          this.file = null
          this.toastr1.showSuccess(response.message);
        },
        error: (error: any) => {
          console.log(error);
          // this.toastr.error(error.error.message);
        },
      });
    } else {
      this.toastr1.showWarning("All Fields are Required");
    }
  }


  //--------------------------------------------GET DRIVER DATA FXN---------------------------------------------
  getDriverData() {
    this.driverservice.getDriver(this.search, this.currentPage, this.limit, this.selectedSortBy, this.selectedSortOrder).subscribe({
      next: (response: any) => {
        this.driverArray = response.driverdata;
        
        // console.log(this.driverArray)
        // console.log(this.driverArray[0].cityDetails.city)
        this.totalPages = response.totalPage;
        this.count = response.count;

        this.updatePaginatedDrivers();
      },
      error: (error: any) => {
        console.log(error)
        // this.toastr.error(error);
      },
    });
  }
  onPageSizeChange(event: any): void {
    this.limit = parseInt(event.target.value);
    this.currentPage = 1;
    this.updatePaginatedDrivers();
    this.getDriverData();
  }
  onPageChange(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePaginatedDrivers();
      this.getDriverData();
    }
  }
  getPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  }
  updatePaginatedDrivers() {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.paginatedDrivers = this.driverArray.slice(startIndex, endIndex);
  }

  // --------------------------------------------DELETE DRIVER DATA FXN---------------------------------------------
  deleteDriver(driverId: string): void {
    console.log(driverId)
    const confirmation = confirm("Are you sure you want to delete this Driver?");

    if (confirmation) {
      this.driverservice.deleteDriver(driverId).subscribe({
        next: (response: any) => {
          console.log(response)
          this.getDriverData();
          this.toastr1.showSuccess(response.message);
          this.isEditMode= false
        },
        error: (error: any) => {
          console.log(error.error.message);
          // this.toastr.error(error.error.message);
        },
      });
    }
  }

  //---------------------------------------EDIT BUTTON-------------------------------------------------------
  editbtn(driver: any): void {
    this.isEditMode = true;
    this.id = driver._id;
    // console.log(driver)
    this.driverFormButton = true;


    this.driverForm.patchValue({
      drivername: driver.drivername,
      driveremail: driver.driveremail,
      countrycode: driver.countrycode,
      city: driver.city,
      driverphone: driver.driverphone,
      status: driver.status
    });
    // console.log(this.driverForm.value)
    // console.log(this.file);
  }
  updateCancel() {
    this.driverFormButton = !this.driverFormButton;
  }

  //-------------------------------------------------------------UPDATE DRIVER FXN-------------------------------------------------------
  updateDriver() {
    const updatedData = this.driverForm.value;
    console.log(updatedData);

    const formdata = new FormData();
    formdata.append("drivername", updatedData.drivername);
    formdata.append("driveremail", updatedData.driveremail);
    formdata.append("countrycode", updatedData.countrycode);
    formdata.append("driverphone", updatedData.driverphone);
    formdata.append("city", updatedData.city);
    formdata.append("profile", this.file);

    this.driverservice.updateDriver(this.id, formdata).subscribe({
      next: (response: any) => {
        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        // console.log(response.updatedDriver);
        this.driverArray.push(response.updatedDriver);
        this.getDriverData();
        this.driverForm.reset();
        this.driverFormButton = false;
        this.file = null
        this.toastr1.showSuccess(response.message);
      },
      error: (error: any) => {
        console.log(error);
        // this.toastr.error(error.error.message);
      },
    });
  }

  // ---------------------------------------DRIVER STATUS---------------------------------------
  driverStatus(driver: any) {
    this.id = driver._id;
    const status = !driver.status;
    this.socket.updatedriverStatus(this.id, status);
  }

  // ----------------------------DRIVER STATUS With Socket.IO----------------------------//
  getDriverStatus() {
    
    const updateStatusSubscription = this.socket.onUpdateStatusData().subscribe({
      next: (response) => {
        this.driverArray = response.data;
        this.getDriverData();
        this.toastr1.showSuccess(response.message);
      },
      error: (error: any) => {
        console.log(error);
        // this.toastr.error(error.error.message)
      }
    })

    this.subscriptions.add(updateStatusSubscription)
  }

  //-----------------------------------------GET VEHICLE DATA FROM DB-----------------------------------------------
  getVehicleNamefromDB() {
    this.driverservice.getVehicleData().subscribe({
      next: (response) => {
        if (Array.isArray(response.data)) {
          this.vehiclesData = response.data;
        } else {
          console.error('Response is not an array:', response);
          this.vehiclesData = [];
        }
        // console.log(this.vehiclesData);
      },
      error: (error) => {
        console.log(error.error.message);
        // this.toastr.error(error)
        this.vehiclesData = []; // Ensure it's always an array
      }
    });

  }
  onSelectedVehicle(vehicle: string): void {
    // console.log(vehicle);
    this.selectedVehicle = vehicle

  }

  // -------------------------------------------------SERVICE FXN------------------------------------------------
  onserviceType(driver: any) {
    this.driverFormButton = false
    this.serviceModal = true;

    // console.log(driver);

    this.id = driver._id
    this.serviceForm.patchValue({
      servicetype: driver.servicetype
    });
  }

  // -----------------------------------------------------UPDATE SERVICE FXN-----------------------------------------------
  updateService(): void {
    const data = this.selectedVehicle
    if (this.serviceForm.valid) {
      this.driverservice.updateService(this.id, data).subscribe({
        next: (response: any) => {
          console.log(response)
          this.driverArray.push(response.existingService);
          console.log(this.driverArray)
          this.getDriverData()
          this.serviceModal = false;
          this.serviceForm.reset();
          // this.toastr1.showSuccess(response.message, "1")

        },
        error: (error: any) => {
          console.error(error);
          // this.toastr.error(error.error)

        }
      });
    }
    this.socket.updatedriverService(this.id, data);
  }

  // ----------------------------DRIVER SERVICE With Socket.IO----------------------------//
  getDriverService() {

    const updateServiceSubscription = this.socket.onUpdateServiceData().subscribe({
      next: (response) => {
        // console.log(response);
        this.getDriverData()
        this.serviceModal = false;
        this.serviceForm.reset();
        this.toastr1.showSuccess(response.message, 'Success');
      },
      error: (error: any) => {
        console.log(error);
        // this.toastr.error(error.error.message)
      }
    })

    this.subscriptions.add(updateServiceSubscription)
  }


  // ----------------------------------------BUTTONS CONTROL PANEL---------------------------------------------
  toggleFormVisibility() {
    this.driverFormButton = !this.driverFormButton;
    this.isEditMode = false;
    this.driverForm.reset()
    this.driverForm.patchValue({
      countrycode: '',
      city: '',
    });
  }
  closeModal(): void {
    this.serviceModal = false;
    this.serviceForm.reset();
  }

  CancelForm() {
    this.driverFormButton = false;
    this.isEditMode = false;
    this.driverForm.reset()
    this.driverForm.patchValue({
      countrycode: '',
      city: '',
    });
  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}
