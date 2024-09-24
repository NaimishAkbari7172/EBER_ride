import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ToastrwrapperService } from "../../services/toastrwrapper.service";
import { UsersService } from "../../services/user.service";
import { AuthService } from "../../services/auth.service";
import { StripeComponent, userdata } from "../../shared/stripe/stripe.component";


@Component({
  selector: "app-users",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.css"],
})

export class UserComponent {
  userupdateForm!: FormGroup;
  AddForm!: FormGroup;
  AddbuttonForm: boolean = false;
  updateForm: boolean = false;
  countrycode: any[] = [];
  file: any;
  selectedCC: any;
  id: any;
  count: any;
  search: string = '';
  usersArray: any[] = [];
  paginatedUsers: any[] = [];
  currentPage = 1
  limit = 5; 
  totalPages = 0; 
  selectedSortBy: string = 'name';
  selectedSortOrder: string = 'asc';
  imageUrl: string | ArrayBuffer | null = null;

  constructor(
    private userservice: UsersService,
    private formBuilder: FormBuilder,
    private toastr1: ToastrwrapperService,
    private authService: AuthService,
    private dialog: MatDialog,

  ) {}

  ngOnInit(): void {
    this.getUserData();
    // this.fetchCountryDataAPI();
    this.getcountryCode();

    
    this.AddForm = this.formBuilder.group({
      profile: [""],
      username: ["", [Validators.required]],
      useremail: ["", [Validators.required, Validators.email]],
      countrycode: ["", [Validators.required]],
      userphone: ["", [Validators.required, Validators.minLength(10)]],
    });

    this.userupdateForm = this.formBuilder.group({
      updateusername: ["", [Validators.required]],
      updateuseremail: ["", [Validators.required, Validators.email]],
      updatecountrycode: [""],
      updateuserphone: ["", [Validators.required, Validators.minLength(10)]],
    });
  }

  // --------------------------------GET COUNTRY CODE DATA FROM REST API--------------------------------------

  getcountryCode(){
    this.userservice.getcode().subscribe({
      next: (response) => {
        // console.log(response)
        response.countrydata.forEach((element: any) => {
          // console.log(element.countryCode)
          this.countrycode.push(element.countryCode)
        });
        this.countrycode.sort();
        // console.log(this.countrycode)
      },
      error: (error: any) => {
        // this.toastr.error(error)
        console.log(error);
      },
    });
  }

  onSelected(value: any) {
    this.selectedCC = value;
    console.log(value)
  }

  // --------------------IMAGE SELECTED---------------------
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

  // --------------------------------------------ADD USER DATA---------------------------------------------
  AddUser() {
    var formData = new FormData();
    formData.append("profile", this.file);
    formData.append("username", this.AddForm.value.username);
    formData.append("useremail", this.AddForm.value.useremail);
    formData.append("countrycode", this.selectedCC);
    formData.append("userphone", this.AddForm.value.userphone);

    if (this.AddForm.valid) {
      this.userservice.addUser(formData).subscribe({
        next: (resp: any) => {
          this.usersArray.push(resp.newUser);
          this.AddForm.reset();
          this.AddbuttonForm = false;
          this.getUserData();
          this.file = null
          this.toastr1.showSuccess(resp.message);
        },
        error: (error: any) => {
          console.log(error);
          // this.toastr.warning(error.error.message);
        },
      });
    } else {
      this.toastr1.showInfo("All Fields are Required");
    }
  }

    // --------------------------------------------GET USER DATA FXN---------------------------------------------
    getUserData() {
      this.userservice.getUsers(this.search, this.currentPage, this.limit, this.selectedSortBy, this.selectedSortOrder).subscribe({
        next: (response: any) => {
          this.usersArray = response.userdata;
          this.totalPages = response.totalPage;
          this.count = response.count;
  
          this.updatePaginatedUsers();
        },
        error: (error: any) => {
          // this.toastr.error(error)
          console.log(error);
        },
      });
    }
    onPageSizeChange(event: any): void {
      this.limit = parseInt(event.target.value);
      this.currentPage = 1;
      this.updatePaginatedUsers();
      this.getUserData();
    }
    onPageChange(pageNumber: number) {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.currentPage = pageNumber;
        this.updatePaginatedUsers();
        this.getUserData();
      }
    }
    getPagesArray(): number[] {
      return Array(this.totalPages).fill(0).map((_, index) => index + 1);
    }
    updatePaginatedUsers() {
      const startIndex = (this.currentPage - 1) * this.limit;
      const endIndex = startIndex + this.limit;
      this.paginatedUsers = this.usersArray.slice(startIndex, endIndex);
    }
  

  // --------------------------------------------DELETE USER DATA---------------------------------------------
  deleteUser(userId: string): void {
    const confirmation = confirm("Are you sure you want to delete this user?");

    if (confirmation) {
      this.userservice.deleteUser(userId).subscribe({
        next: (response: any) => {
          console.log(response)
          this.usersArray.push(response.newUser);
          this.getUserData();
          this.toastr1.showSuccess(response.message);
          this.updateForm=false
        },
        
        error: (error: any) => {
          console.log(error.error.message);
          // this.toastr.error(error.error.message);
        },
      });
    }
  }

  // --------------------------------------------UPDATE USER DATA---------------------------------------------
  updateBtnClick(user: any): void {
    this.id = user._id;
    this.updateForm = true;
    this.AddbuttonForm = false
    this.userupdateForm.patchValue({
      updateusername: user.username,
      updateuseremail: user.useremail,
      updatecountrycode: user.countrycode,
      updateuserphone: user.userphone,
    });
    // console.log(user.countrycode)
  }
  updateUSER(): void {
    const updatedData = this.userupdateForm.value;
    // console.log(updatedData.updateusername)
    var formdata = new FormData();
    formdata.append("profile", this.file);
    formdata.append("updateusername", updatedData.updateusername);
    formdata.append("updateuseremail", updatedData.updateuseremail);
    formdata.append("updatecountrycode", updatedData.updatecountrycode);
    formdata.append("updateuserphone", updatedData.updateuserphone);

    this.userservice.updateUser(this.id, formdata).subscribe({
      next: (response: any) => {
        console.log(response);
        this.usersArray.push(response.updatedUser);
        this.getUserData();
        this.userupdateForm.reset();
        this.file = null
        this.updateForm = !this.updateForm;
        this.toastr1.showSuccess(response.message);
      },
      error: (error: any) => {
        console.log(error);
        // this.toastr.error(error.error.message);
      },
    });
  }


  //-------------------------------------STRIPE--------------------------------------//
  openDialog(val: any) {
    // console.log(val)
    const dialogData: userdata = {
      userdata: val,
    };

    const dialogRef: MatDialogRef<StripeComponent> = this.dialog.open(
      StripeComponent,
      {
        width: '650px',
        data: dialogData,
      }
    );

    dialogRef.afterClosed().subscribe((data: string) => {
      console.log("success add card");
    });
  }



  // --------------------------------------------CUSTOM CODE---------------------------------------------//
  updateCancel() {
    this.updateForm = !this.updateForm;
  }
  
  toggleFormVisibility() {
    this.AddbuttonForm = !this.AddbuttonForm;
    this.updateForm = false
    this.AddForm.reset()
    this.AddForm.patchValue({
      countrycode:''
    });
  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}
