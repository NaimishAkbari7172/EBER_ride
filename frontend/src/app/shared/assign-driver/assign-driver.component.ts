import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '../../services/socket.service';
import { ToastrwrapperService } from '../../services/toastrwrapper.service';
import { Subscription } from 'rxjs';
import { TimerService } from '../../services/timer.service';
import { SettingService } from '../../services/setting.service';

@Component({
  selector: 'app-assign-driver',
  templateUrl: './assign-driver.component.html',
  styleUrl: './assign-driver.component.css'
})
export class AssignDriverComponent implements OnInit, OnDestroy {
  dataArray: any[] = [];
  nearestDrivers: any;
  driverArray: any[] = [];
  search!: string;
  currentPage!: number;
  limit!: number;
  selectedSortBy!: string;
  selectedSortOrder!: string;
  cityId: any;
  serviceId: any;
  rejectdriver: any;
  driver: any;
  rideTimeouts: number

  private subscriptions: Subscription = new Subscription();

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<AssignDriverComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private socketService: SocketService,
    private toastr1: ToastrwrapperService,
    private timerService: TimerService,
    private settingService : SettingService
  ) { }


  ngOnInit(): void {
    this.getDriverData()
    this.assigndriverdata()
    this.gettingrejectrunningrequestdata();
    this.listenassignrejected()
    this.getNearest()

    this.settingService.getsettingdata().subscribe({
      next: (data) => {
        // console.log(data)
            this.rideTimeouts= data.rideTimeouts
            console.log(this.rideTimeouts)
      }
    })

    this.dataArray = this.data;
   
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }


  //-------------------------------------GET NEAREST DATA--------------------------------------------------------//
  getNearest(){
    const assignDriverSubscription = this.socketService.onAssignedDriverData().subscribe((driverData) => {
      if (driverData.length>0) {
        this.nearestDrivers = this.driverArray[0];
        // console.log(JSON.stringify(this.nearestDrivers)+ "/////////////////")
      } else {
        console.log('Error retrieving nearest driver data:', driverData);
      }
    })

    this.subscriptions.add(assignDriverSubscription)
  }

  // ---------------------------------------GET ASSIGNED DRIVER DATA USING SOCKET-----------------------------------------//
  getDriverData() {

    this.cityId = this.data.cityId;
    this.serviceId = this.data.serviceId;

    this.socketService.getAssignedDriverData(this.cityId, this.serviceId)

    const updateStatusSubscription = this.socketService.onUpdateStatusData().subscribe({
      next: (response) => {
        console.log(response)

        this.socketService.getAssignedDriverData(this.cityId, this.serviceId)
        const assignDriverSubscription = this.socketService.onAssignedDriverData().subscribe((driverData) => {
          console.log(driverData+ ":::::::::::");
          if (driverData.length>0) {

            this.driverArray = driverData;

            console.log(this.driverArray);

          } else {
            console.log('Error retrieving assigned driver data:', driverData);
          }
        });

        this.subscriptions.add(assignDriverSubscription)
      }
    })

    this.subscriptions.add(updateStatusSubscription)

    const assignDriverSubscription = this.socketService.onAssignedDriverData().subscribe((driverData) => {
      if (driverData.length>0) {
        this.driverArray = driverData;
      } else {
        console.log('Error retrieving assigned driver data:', driverData);
      }
    });

    this.subscriptions.add(assignDriverSubscription)


    // ------------------------UPDATE SERVICE DATA ON REAL TIME---------------------------//
    const updateServiceSubscription = this.socketService.onUpdateServiceData().subscribe({
      next: (servicedata) => {
        // console.log(servicedata);
        this.socketService.getAssignedDriverData(this.cityId, this.serviceId)

        if (servicedata) {

          this.driverArray = servicedata;
          // console.log(this.driverArray);

        } else {
          console.log('Error retrieving assigned driver data:', servicedata);
        }
      }


    });

    this.subscriptions.add(updateServiceSubscription)

  }

  // --------------------------ASSIGN DRIVER FROM DIALOG REF BUTTON-----------------------//
  assigndriverdata() {
    const finalAssignedSubscription = this.socketService.onFinalassignedDriverData('data').subscribe({
      next: (response) => {
        console.log("New Assigned Driver Details: :::::::::   ",response);

        this.socketService.getAssignedDriverData(this.cityId, this.serviceId)
        console.log(this.cityId, this.serviceId);


        const assignDriverSubscription = this.socketService.onAssignedDriverData().subscribe((driverData) => {
          console.log("Remaining Driver to Assign ]]]]]]]]]]]]]]]]]]]]]]]] ",driverData);
          this.driverArray = driverData;
        });

        this.subscriptions.add(assignDriverSubscription)
      }
    })

    this.subscriptions.add(finalAssignedSubscription)
  }


  assignDriver(driver: any) {
    // console.log(driver);
    const alldata = {
      ridedata: this.data,
      driverdata: driver
    }

    this.timerService.startTimer(this.data._id, this.rideTimeouts); 
    this.dialogRef.close(alldata);
    // this.dialogRef.close(driver);
  }

  NearestDriver(driver: any) {
    console.log(driver)
    if(!driver){
      new Notification("No driver found")
    }
    this.data.nearest = true
    
    if(driver){
      const alldata = {
        ridedata: this.data,
        driverdata: driver
      }

      this.timerService.startTimer(this.data._id, this.rideTimeouts); 
      this.dialogRef.close(alldata);
    }else{
      this.toastr1.showInfo("No nearest driver available")
    }

  }


  //--------------------(REJECT SINGLE)when data driver is free then that time this process run-----------------------//
  listenassignrejected() {
    const assignRejectSubscription = this.socketService.listenassignrejected().subscribe((response: any) => {
      new Notification("Driver not found")
      this.getDriverData();
    });

    this.subscriptions.add(assignRejectSubscription)
  }

//-----------------(REJECT NEAREST)when data driver is free then that time this process run---------------------//
  gettingrejectrunningrequestdata() {
    const rejectRunningReqSubscription = this.socketService.listenrejectRunningRequest().subscribe((response: any) => {
      // console.log(response)

      this.getDriverData();
    });

    this.subscriptions.add(rejectRunningReqSubscription)


  }

}
