import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  adminUpdateForm!: FormGroup;
  showForm: boolean = false;
  personDataArray: any
  selectedAdmin: any;
    
    constructor(
      private apiservice: ApiService, 
      private formBuilder: FormBuilder, 
      private authService: AuthService,
      private toastr: ToastrService
    ) { }

    ngOnInit(): void {
      this.fetchUserData();

      this.adminUpdateForm = this.formBuilder.group({
        adminName: '',
        email: '',
        password: ''
        // Add other form controls based on your requirements
      });
    }



    fetchUserData(): void {
      this.apiservice.getuserData().subscribe({
        next: (users: any) => {
          console.log(users)
          this.personDataArray = users.user.map((admin: any) => ({
            _id: admin._id,
            adminName: admin.adminName,
            email: admin.email,
            // cnfpassword: admin.cnfpassword,
          }));
        },
        error: (error: any) => {
          this.toastr.error(error);
        }
    });
    }


    updateAdminBtn(person: any): void{
      this.selectedAdmin = person;
      console.log( this.selectedAdmin)
      this.showForm = true;
      this.adminUpdateForm.patchValue({
        adminName: this.selectedAdmin.adminName,
        email: this.selectedAdmin.email,
        password: this.selectedAdmin.password,
        // Update other form controls based on your requirements
      });
    }

    adminUpdate(userId: string): void{
      const updatedData = this.adminUpdateForm.value;
      console.log(updatedData)
      this.apiservice.updateUser(userId, updatedData).subscribe({
        next: (response: any) => {
          alert(response.message)
          this.fetchUserData();
          this.showForm = !this.showForm;
        },
        error: (error: any) => {
          this.toastr.error('Failed to update admin');
        }
      })
    }

    updateCancel(){
      this.showForm = !this.showForm;
    }

    deleteAdmin(userId: string): void {
      const confirmation = confirm('Are you sure you want to delete this admin?');
      if (confirmation) {
        this.apiservice.deleteUser(userId).subscribe({
          next: (response: any) => {
            alert('Admin Deleted Successfully');
            this.fetchUserData(); // Fetch updated user data after deletion
          },
          error: (error: any) => {
            this.toastr.error('Failed to delete admin');
          }
      });
      }
    }


    resetTimer() {
      this.authService.resetInactivityTimer();
    }
}
