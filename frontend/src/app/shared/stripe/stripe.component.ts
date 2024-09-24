import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { loadStripe } from '@stripe/stripe-js';
import { StripeService } from '../../services/stripe.service';
import { ToastrwrapperService } from '../../services/toastrwrapper.service';


@Component({
  selector: 'app-creditcard',
  templateUrl: './stripe.component.html',
  styleUrl: './stripe.component.css'
})
export class StripeComponent {
  selectddefaultid: any;
  defalutcard: any;
  cardLists: any;
  AddCardUser: any;
  cardlist: any = true;
  stripe: any;
  cardElement: any;
  paymentElement: any;
  elements: any;
  addcard: any;
  userid: any;
  userdata: any;
  carddata: any[] = [];
  isDefault: any;


  constructor(public dialogRef: MatDialogRef<StripeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: userdata, 
    private http: HttpClient,
    private toastr1: ToastrwrapperService,
    private stripeService: StripeService
  ) { }


  async ngOnInit() {
    // console.log(this.data);


    this.userdata = this.data.userdata;
    this.userid = this.userdata._id
    // console.log(this.userdata);
    // console.log(this.userid);

    this.stripe = await loadStripe('pk_test_51PVRDa06N1UTHog93ZQvgeHMLUQT0Ii6924xGTibQOlLR6aglJUxkGr7SCoknrrimOrTOKDHYYgQvK1nXE4Tk2G4005upHwZyB');
    this.elements = this.stripe.elements();


    this.cardElement = this.elements.create('card');

    this.cardElement.mount('#card-element');
    this.getCard(this.userid)

  }
  // setDefault() {
  //   this.isDefault = !this.isDefault;
  // }



    //------------------------------------------GET CARD STRIPE-----------------------------------------// 
    getCard(id: any) {
      const userid = id
  
      this.stripeService.getcard(id).subscribe({
        next: (response: any) => {
          this.carddata = response.paymentMethodsData;

        },
        error: (error) => {
          console.log(error);
        }
      })
    }
  
  



  //------------------------------------------ADD CARD STRIPE-----------------------------------------//  
  async addCard(id: any) {
    // console.log(id);

    const paymentMethod = await this.stripe.createToken(
      this.cardElement,
    );
    const token = await paymentMethod.token
    console.log('succes: ', await paymentMethod.token);
    console.log("Token: ", token);


    const response = await fetch(`http://localhost:4000/addcard/${id}`, {
    // const response = await fetch(`http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com/addcard/${id}`, {
      method: 'POST',
      headers: {
        'Content-type': 'Application/json'
      },
      body: JSON.stringify({ token })
    });

    this.getCard(this.userid);
  }



  //------------------------------------------DELETE CARD STRIPE-----------------------------------------// 
  deleteCard(id: any) {
    console.log(id);

    // const confirmDelete = confirm("Are you sure you want to delete this card?");
    // if (confirmDelete) {
    this.stripeService.deletecard(id).subscribe({
      next: (res: any) => {
        this.toastr1.showSuccess(res.message)
        this.getCard(this.userid)
      },
      error: (error) => {
        console.log(error);
      }
    })
    // }
  }

  async setdefaultCard(customerId: any, cardId: any) {
    console.log(customerId);
    console.log(cardId);
    this.http
      .patch(`http://localhost:4000/setdefaultcard/${customerId}`, { cardId })
      // .patch(`http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com/setdefaultcard/${customerId}`, { cardId })
      .subscribe(
        (data: any) => {
          console.log(data);
          this.isDefault = cardId;
          this.getCard(this.userid)
        },
        (error: any) => {
          console.error("Error:", error);
        }
      );
  }


  closeDialog(): void {
    this.dialogRef.close();
  }


}
export interface userdata {
  userdata: String;
}

