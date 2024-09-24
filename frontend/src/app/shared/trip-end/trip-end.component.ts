import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StripeService } from '../../services/stripe.service';
import { ToastrwrapperService } from '../../services/toastrwrapper.service';

declare var Stripe: any;

@Component({
  selector: 'app-trip-end',
  templateUrl: './trip-end.component.html',
  styleUrl: './trip-end.component.css'
})

export class TripEndComponent implements OnInit {

  amount: number 
  formattedAmount: any
  userId: string;
  user: any;
  paymentCharge: any

  constructor( 
      public stripeService: StripeService,
      public toastr1: ToastrwrapperService,
      public dialog: MatDialog,
      public dialogref: MatDialogRef<TripEndComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {

    this.amount= this.data.estimateFare
    this.formattedAmount = this.formatAmount(this.amount);
    this.userId = this.data.userDetails._id
    console.log(this.data)
     
  }

  
  formatAmount(amount: number): string {
    return '₹' + amount.toFixed(2);
  }

  confirmPayment(): void {
    this.stripeService.processPayment(this.userId, this.amount).subscribe(
      response => {
        
        if (response.success) {
          this.data.ridePay = true
          this.toastr1.showSuccess("Payment successful !")
          console.log('Payment successful!',  response.paymentIntent);
        } else {
          this.toastr1.showError("Add card details and payment", "payment failed")
          console.error('Payment failed', response);
        }
        this.dialogref.close(response);
      },
      error => {
        // this.toastr.error(error.error.message)
        console.error('Error processing payment', error);
      }
    );
  }


}
