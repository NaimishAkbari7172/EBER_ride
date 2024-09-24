import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { ToastrwrapperService } from '../../services/toastrwrapper.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FeedbackComponent } from '../../shared/feedback/feedback.component';
import { TimerService } from '../../services/timer.service';
import { TripEndComponent } from '../../shared/trip-end/trip-end.component';
import { Subscription } from 'rxjs';
import { SettingService } from '../../services/setting.service';

@Component({
  selector: 'app-runningrequest',
  templateUrl: './runningrequest.component.html',
  styleUrl: './runningrequest.component.css'
})
export class RunningrequestComponent implements OnInit, OnDestroy {
  assignedArray: any;
  driverId: any;
  rideId: any;
  driverdata: any;
  rideTimeouts: number;
  notified: boolean;
  private timeoutSubscription: Subscription | null = null;


  private subscriptions: Subscription = new Subscription();

  constructor(
    private _socketservice: SocketService,
    private toastr1: ToastrwrapperService,
    private _socket: SocketService,
    private dialog: MatDialog,
    private timerService: TimerService,
    private settingService: SettingService,
  ) { }

  ngOnInit() {    
    this.getRunningData();
    this.assigneddriverfromAssignDialogBox();
    this.afterrejectrunningrequest();
    // this.listenassignrejected()
    this.ridestatusupates()
    // this.timeoutrunningreq()
    this.listeningwhendriverisnearest()
    this.listeningmytaskfunc()
    this.listennearestassignbuttonclick()

    this.settingService.getsettingdata().subscribe({
      next: (data) => {
            this.rideTimeouts= data.rideTimeouts
      }
    })
  }

  ngOnDestroy() {
    console.log("11")
    this.subscriptions.unsubscribe();
  }

  getRunningData() {

    this._socketservice.emitRunningData()
    const runningDataSubscription = this._socketservice.listenGetRunning().subscribe((data: any) => {
      this.assignedArray = data.alldata;

      // Start timer for each ride
      this.assignedArray.forEach((ride: any) => {
        this.timerService.startTimer(ride._id, this.rideTimeouts);
        this.subscribeToTimer(ride._id);
      });
    });

    this.subscriptions.add(runningDataSubscription);
  }

  subscribeToTimer(rideId: string) {
    const timerSubscription = this.timerService.getTimeLeftObservable(rideId).subscribe((timeLeft: number) => {
      const ride = this.assignedArray.find((ride: any) => ride._id === rideId);
      if (ride) {
        ride.timeLeft = timeLeft;
      }
    });
    this.subscriptions.add(timerSubscription);
  }


  getRemainingTime(rideId: string) {
    return this.timerService.getTimeLeft(rideId);
  }

  //---------------ON REJECT RIDE REQUEST BUTTON CLICK--------------------//
  rejectRide(data: any) {
    this.rideId = data._id
    this.driverId = data.driverId


    this.rejectRunningRequest(this.driverId, this.rideId);
  }

  //------------------------------RUNNING REQUEST REJECT------------------------------------//
  rejectRunningRequest(driverId: string, rideId: string) {
    console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }

    this._socketservice.emitrejectRunningRequest(data)
    this.getRunningData()
  }



  //---------------ON ACCEPT RIDE REQUEST BUTTON CLICK--------------------//
  acceptRide(data: any) {
    // console.log(data);
    this.rideId = data._id
    this.driverId = data.driverId

    this.acceptrunningrequest(this.driverId, this.rideId);
  }

  //---------------ON ACCEPT RIDE REQUEST BUTTON CLICK--------------------//
  arriveRide(data: any) {
    this.rideId = data._id

    this.arrivedrunningrequest(this.driverId, this.rideId);
  }

  //---------------ON ACCEPT RIDE REQUEST BUTTON CLICK--------------------//
  pickRide(data: any) {
    this.rideId = data._id

    this.pickedrunningrequest(this.driverId, this.rideId);
  }

  //---------------ON ACCEPT RIDE REQUEST BUTTON CLICK--------------------//
  startRide(data: any) {
 
    this.rideId = data._id
    this.startedrunningrequest(this.driverId, this.rideId);
  }


  //---------------ON ACCEPT RIDE REQUEST BUTTON CLICK--------------------//
  completeRide(data: any) {
    
    this.rideId = data._id
    this.driverId = data.driverId

    // console.log(data.paymentOption)

    if(data.paymentOption === "card"){

      const dialogConfig = new MatDialogConfig();
  
      dialogConfig.disableClose = false;
      dialogConfig.autoFocus = true;
      dialogConfig.width = '400';
      dialogConfig.height = '200px'; // Set the desired height
      dialogConfig.data = data;
  
      dialogConfig.panelClass = 'custom-dialog-container'; // Add a custom class for vertical scrollig css
  
      const dialogRef = this.dialog.open(TripEndComponent, dialogConfig);
      
      dialogRef.afterClosed().subscribe((payData: any) => {
        if(payData.success){
          console.log(payData)
          this.completedrunningrequest(this.driverId, this.rideId);
        }
      })
    }

    this.completedrunningrequest(this.driverId, this.rideId);
  }
    
  //---------------ON FEEDBACK RIDE REQUEST BUTTON CLICK--------------------//
  freerideanddriver(data: any) {
    // console.log(data);
    this.rideId = data._id
    this.driverId = data.driverId

    this.freerideanddriverrunningrequest(this.driverId, this.rideId);


    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '650px';
    dialogConfig.height = '500px';
    dialogConfig.data = data;

    const dialogRef = this.dialog.open(FeedbackComponent, dialogConfig);

    // Handle dialog close events if needed
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with result:', result);
    });
  }

  //------------------------------ACCEPT REQUEST REJECT------------------------------------//
  acceptrunningrequest(driverId: string, rideId: string) {
    // console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }

    this._socketservice.emitaccept(data)
    this.getRunningData()
  }

  arrivedrunningrequest(driverId: string, rideId: string) {
    // console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }

    this._socketservice.emitarrived(data)
    this.getRunningData()
  }
  pickedrunningrequest(driverId: string, rideId: string) {
    // console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }

    this._socketservice.emitpicked(data)
    this.getRunningData()
  }

  startedrunningrequest(driverId: string, rideId: string) {
    // console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }

    this._socketservice.emitstarted(data)
    this.getRunningData()
  }

  completedrunningrequest(driverId: string, rideId: string) {

    const data = {
      rideId: rideId,
      driverId: driverId
    }

    this._socketservice.emitcompleted(data)
    this.getRunningData()
  }

  freerideanddriverrunningrequest(driverId: string, rideId: string) {
    // console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }

    this._socketservice.emitfree(data)
    this.getRunningData()
  }
  //--------------------AFTER ACCEPTING RIDE-----------------------//
  ridestatusupates() {
    const rideStatusUpdateSubscription = this._socketservice.listeningrideupdates().subscribe((response: any) => {
      console.log("ride completed")
    });
    this.subscriptions.add(rideStatusUpdateSubscription)
  }


  //-------------------AFTER REJECTING RIDE ASSIGN ONE-------------------------//
  // listenassignrejected() {
    // const listenassignrejectedSubscription = this._socketservice.listenassignrejected().subscribe((response: any) => {
      // this.getRunningData()
      // new Notification("driver not found")
    // });
    // this.subscriptions.add(listenassignrejectedSubscription)
  // }

  //-----------------REJECT NEAREST ASSIGN RIDE------------------//
  afterrejectrunningrequest() {
    const afterrejectrunningrequestSubscription = this._socketservice.listenrejectRunningRequest().subscribe((response: any) => {
      this.getRunningData()
    });
    this.subscriptions.add(afterrejectrunningrequestSubscription)
  }



  //  when the assign the driver data that time show a running requeszt data 
  assigneddriverfromAssignDialogBox() {
    const assigneddriverfromAssignDialogBoxSubscription =  this._socketservice.onFinalassignedDriverData('data').subscribe((res: any) => {
      this.getRunningData()
    })
    this.subscriptions.add(assigneddriverfromAssignDialogBoxSubscription);
  }

  //---------------------WHEN NEAREST ASSIGN CLICKED--------------------//
  listennearestassignbuttonclick() {
    const listennearestassignbuttonclickSubscription=   this._socketservice.listeningnearestdriver().subscribe((res: any) => {
      console.log(res);

      this.getRunningData()
    })
    this.subscriptions.add(listennearestassignbuttonclickSubscription);
  }

  //------------TIMEOUT RUNNING REQUEST--------------------//
  // timeoutrunningreq() {
  //   const timeoutSubscription = this._socketservice.listeningrunningtimeoutinRR().subscribe((res: any) => {
  //     console.log("socket called", res);

  //     this.toastr1.showSuccess("Sorry! Ride Timeout")
  //     // new Notification("No driver found")
  //     // this.getRunningData()
  //   })
  //   this.subscriptions.add(timeoutSubscription);
  // }

  //------------TIMEOUT RUNNING REQUEST--------------------//
  listeningmytaskfunc() {
    const listeningmytaskfuncSubscription = this._socket.listeningmytaskfunc().subscribe((response: any) => {
      // console.log("runnung request 329")
      this.getRunningData();
    })
    this.subscriptions.add(listeningmytaskfuncSubscription);
  }

  //------------TIMEOUT RUNNING REQUEST--------------------//
  listeningwhendriverisnearest() {
    const listeningwhendriverisnearestSubscription = this._socket.listeningwhendriverisnearest().subscribe((response: any) => {

      this.getRunningData();
    })
    this.subscriptions.add(listeningwhendriverisnearestSubscription);
  }


}
