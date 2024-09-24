import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmrideService } from './../../services/confirmride.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { InfoDialogComponent } from '../../shared/info-dialog/info-dialog.component';
import { AssignDriverComponent } from '../../shared/assign-driver/assign-driver.component';
import { SocketService } from '../../services/socket.service';
import { VehicleService } from '../../services/vehicle.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirmride',
  templateUrl: './confirmride.component.html',
  styleUrls: ['./confirmride.component.css']
})
export class ConfirmrideComponent implements OnInit, OnDestroy{
  ridesArray: any[] = []
  limit: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;
  count: any
  search: String = '';
  paginatedRideData: any[] = [];
  driverArray: any = [];
  rideStatus!: string;
  assignedDriverName!: string;
  driverdataArray: any;
  driverId: any;
  rideId: any;
  statusfilter: Number = -1;
  vehiclefilter: String = '';
  filteredVehicles: string[] = [];
  searchText: any;
  searchDate: any;
  sortOrder: any = 'desc';
  cityId: any;
  serviceId: any;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private confirmride: ConfirmrideService,
    private dialog: MatDialog,
    private socket: SocketService,
    private vehicleservice: VehicleService,
  ) { }

  ngOnInit(): void {

    this.getrideData()
    this.getVehicle()
    this.gettingstatusafterassigninCFR()
    this.gettingstatusafterrejectinCFR()
    this.listeningtimeoutstatusinCFR()
    this.listeningwhendriverisnearest()
    this.listenassignrejected()
    this.listennearestassignbuttonclick()
    this.ridestatusupates()
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  //-------------------------------------------- GET RIDE DATA with SEARCH, PAGINATION, FILTER   ---------------------------------------------
  getrideData() {

    this.confirmride.getride(this.currentPage, this.limit).subscribe({
      next: (resp: any) => {
        // console.log(resp.rides[0]);
        this.ridesArray = resp.rides;
        this.count = resp.totalCount;
        this.totalPages = resp.totalPages;
        // console.log(this.ridesArray, this.count, this.totalPages)
      }, error(err: any) {
        console.log(err)
        // this.toastr.error(err);
      }
    })

  }

  getSearchData() {
    this.search = this.searchText || this.searchDate;
    this.confirmride.getfilter(this.currentPage, this.limit, this.search, this.statusfilter, this.vehiclefilter, this.sortOrder).subscribe({
      next: (response: any) => {
        console.log(response.rides.id)
        this.ridesArray = response.rides;
        this.totalPages = response.totalPages;
        this.count = response.totalCount;

      },
      error: (error: any) => {
        console.log(error)
      },
    });

  }

  onPageSizeChange(event: any): void {
    this.limit = parseInt(event.target.value);
    this.currentPage = 1;
    this.updatePaginatedDrivers();
    this.getrideData();
  }
  onPageChange(pageNumber: number) {
    console.log(pageNumber)
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePaginatedDrivers();
      this.getrideData();
    }
  }

  getPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  }


  updatePaginatedDrivers() {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.paginatedRideData = this.ridesArray.slice(startIndex, endIndex);
  }


  //-----------------------------------GET VEHICLE ARRAY IN FILTER------------------------------//
  getVehicle() {
    this.vehicleservice.getvehicle().subscribe({
      next: (response: any) => {
        this.filteredVehicles = response.data.map((vehicle: any) => vehicle.vehicleName);
        // console.log(this.filteredVehicles);
      },
      error(err: any) {
        console.log(err)
        // this.toastr.error(err)
      }
    });
  }


  clearFilter() {
    this.statusfilter = -1;
    this.vehiclefilter = '';
    this.sortOrder = 'asc'

    this.getrideData()
  }


  //--------------------------------------INFO DIALOG REF CODE---------------------------------------------//
  openInfoDialog(ride: any): void {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '650px';
    dialogConfig.height = '500px'; // Set the desired height
    dialogConfig.data = ride;

    dialogConfig.panelClass = 'custom-dialog-container'; // Add a custom class for vertical scrollig css

    const dialogRef = this.dialog.open(InfoDialogComponent, dialogConfig);

  }

  //--------------------------------------ASSIGN DIALOG REF CODE---------------------------------------------//
  openAssignDriverDialog(ride: any): void {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '1000px';
    dialogConfig.height = '500px'; // Set the desired height
    dialogConfig.data = ride;
    dialogConfig.panelClass = 'custom-dialog-container'; // Add a custom class for vertical scrollig css

    const dialogRef = this.dialog.open(AssignDriverComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((data: any) => {
      if(data){
        this.driverdataArray = data
        this.driverId = this.driverdataArray.driverdata._id
        this.rideId = this.driverdataArray.ridedata._id
        this.cityId = this.driverdataArray.ridedata.cityId
        this.serviceId = this.driverdataArray.ridedata.serviceId
        //==========emit data into socket.js when dialog box close=============
        // console.log("====================="+ this.driverdataArray.ridedata.nearest)
  
        if (this.driverdataArray.ridedata.nearest == false) {
          this.socket.emitassignedDriver(this.driverId, this.rideId)
        } else {
          this.socket.emitnearestdriver(this.rideId, this.cityId, this.serviceId)
  
          //--------------SENDING PUSH NOTIFICATION DRIVER NOT FOUND-----------------//
          const myTaskSubscription = this.socket.listeningmytaskfunc().subscribe((response: any) => {
            // console.log("confirm ride 200 ::  - - - - - - - - - - -")
            this.getrideData();
          })
          this.subscriptions.add(myTaskSubscription)
        }
      }

    });
  }

  //-----------------SHOW UPDATED STATUS IN CFR AFTER ASSIGN BUTTON CLICK-------------------------//
  gettingstatusafterassigninCFR() {
    const finalAssignSubscription = this.socket.onFinalassignedDriverData('data').subscribe((response: any) => {
      this.getrideData();
    })

    this.subscriptions.add(finalAssignSubscription)
  }
  
  //-----------------SHOW UPDATED STATUS IN CFR AFTER REJECT BUTTON CLICK (BOTH Single and Nearest)-------------------------//
  listenassignrejected() {
    const listenAssignRejectSubscription = this.socket.listenassignrejected().subscribe((response: any) => {
      this.getrideData();
    })

    this.subscriptions.add(listenAssignRejectSubscription)
  }
  
  gettingstatusafterrejectinCFR() {
    const rejectRunningSubscripton = this.socket.listenrejectRunningRequest().subscribe((response: any) => {
      this.getrideData();
    })

    this.subscriptions.add(rejectRunningSubscripton)
  }
  
  //-----------------SHOW UPDATED STATUS IN CFR AFTER TIME-OUT-------------------------//
  listeningtimeoutstatusinCFR() {
    const timeoutStatusSubsription = this.socket.listeningtimeoutstatusinCFR().subscribe((response: any) => {
      this.getrideData();
    
    })

    this.subscriptions.add(timeoutStatusSubsription)
  }
  
  //-----------------SHOW UPDATED STATUS IN CFR AFTER TIME-OUT-------------------------//
  listeningwhendriverisnearest() {

    const driverNearestSubscription = this.socket.listeningwhendriverisnearest().subscribe((response: any) => {  
      this.getrideData();
    })

    this.subscriptions.add(driverNearestSubscription)
  }
  
  //---------------------WHEN NEAREST ASSIGN CLICKED--------------------//
  listennearestassignbuttonclick() {
    const nearestDriverSubscription = this.socket.listeningnearestdriver().subscribe((res: any) => {
      this.getrideData()
    })

    this.subscriptions.add(nearestDriverSubscription)
  }
  
  //----------------AFTER ACCEPT RIDE IN REAL-TIME STATUS UPDATES----------------//
  ridestatusupates() {
    const rideUpdateSubscription = this.socket.listeningrideupdates().subscribe((ridedata: any) => {
      this.getrideData()
    })

    this.subscriptions.add(rideUpdateSubscription)
  }
  
  
  //--------------------------------CANCEL RIDE------------------------------------------//
  cancelride(rideId: any) {
    console.log(rideId);
    this.socket.emitcancelride(rideId)
    
    const cancelRideSubscription = this.socket.listencancelride().subscribe((ridedata: any) => {
      console.log(ridedata);
      this.getrideData()
    })
    
    this.subscriptions.add(cancelRideSubscription)
  }



  // ---------------------------------------EXTRA COMMON CODE--------------------------------------------//
  resetTimer() {
    this.authService.resetInactivityTimer();
  }

}

