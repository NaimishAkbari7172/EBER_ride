
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ToastrwrapperService } from '../../services/toastrwrapper.service';
import { CountryService } from '../../services/country.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrl: './country.component.css'
})
export class CountryComponent {
  countryForm!: FormGroup;
  AddbuttonForm: boolean = false;
  countryData: any;
  file: any;
  symbol: any;
  currenciesObj: any;
  currencyKeys: any;
  firstCurrencyKey: any;
  currencysymbol: any;
  flag: any;
  addcountrydata: any = {
    countryname: '',
    countrycurrency: '',
    countrytimezone: '',
    countrycode: '',
    flag: ''
  }
  countryDataDB: any[] = [];
  search: string = '';


  constructor( 
    private countryservice: CountryService,
    private formbuilder: FormBuilder, 
    private toastr: ToastrService,
    private toastr1: ToastrwrapperService, 
    private authService: AuthService
  ) {

  }

  ngOnInit(): void {
    this.fetchCountryDataAPI();
    this.getDatafromDB();
    this.countrySearch();

    this.countryForm = this.formbuilder.group({
      countryname: ['', Validators.required],
      countrytimezone: ['', Validators.required],
      countrycode: ['', Validators.required],
      countrycurrency: ['', Validators.required],
      flag: ['', Validators.required]
    });

  }

  toggleFormVisibility() {
    this.AddbuttonForm = !this.AddbuttonForm;
  };

   // ------------------------------------SEARCH COUNTRY DATA------------------------------//
  countrySearch() {
    // console.log('hui')
    this.countryservice.searchCountry(this.search).subscribe({
      next: (response: any) => {
        this.countryDataDB = response.countrydata;
      },
      error: (error: any) => {
        console.log(error)
        // this.toastr.error(error);
      },
    });
  }

  OnSubmit() {
    if (this.countryForm.valid) {

      const formvalue = this.countryForm.value

      this.addcountrydata = {
        countryName: formvalue.countryname,
        countryCurrency: formvalue.countrycurrency,
        countryTimeZone: formvalue.countrytimezone[0],
        countryCode: formvalue.countrycode,
        flagImage: formvalue.flag
      }
      // console.log( this.addcountrydata.flagImage)

      this.countryservice.addCountry(this.addcountrydata).subscribe({
        next: (res) => {
          this.countryDataDB.push(res.countrydata);
          console.log(res)
          this.getDatafromDB()
          this.countryForm.reset();
          this.AddbuttonForm = false;
          this.toastr1.showSuccess(res.message);
        },
        error: (error) => {
          console.log(error);
          // this.toastr.warning(error.error.message);
        }
      });
    }
  }

  getDatafromDB(): void {
    this.countryservice.getCountryData().subscribe({
      next: (response: any) => {
        this.countryDataDB = response.countrydata
      },
      error: (err) => {
        console.log(err)
        // this.toastr.error(err);
      },
    });
  }

  fetchCountryDataAPI(): void {
    this.countryservice.fetchCountryAPI().subscribe({
      next: (response) => {
        // console.log(response)
        this.countryData = response;
      },
      error: (error) => {
        console.log(error)
        // this.toastr.error(error);
      }
    });
  }

  onSelected(countryValue: string) {
    const selectedCountry = this.countryData.find((country: any) => country.name.common === countryValue);
    // console.log(selectedCountry.flags)
    // console.log(selectedCountry.currencies.INR.symbol)

    this.currenciesObj = selectedCountry.currencies;
    this.currencyKeys = Object.keys(this.currenciesObj);
    this.firstCurrencyKey = this.currencyKeys[0];
    this.currencysymbol = this.currenciesObj[this.firstCurrencyKey];
    this.symbol = this.currencysymbol.symbol;
    this.flag = selectedCountry.flags.png;

    if (selectedCountry) {
      this.countryForm.patchValue({
        countryname: selectedCountry.name.common,
        countrytimezone: selectedCountry.timezones,
        // countrycode: selectedCountry.cca2,
        countrycode: (selectedCountry.idd.root + selectedCountry.idd.suffixes[0]),
        countrycurrency: this.symbol,
        flag: selectedCountry.flags.png
      });
    }
  }

  //In this code, we first check if res is defined and has a length greater than 0. Then, we access selectedCountry.currencies to get the currencies object. We retrieve the currency keys using Object.keys(currencies) and check if there is at least one currency key. If there is, we select the first currency key (currencyKeys[0]) and retrieve the corresponding currency object from currencies. Finally, we check if the currency object and symbol property exist before assigning currency.symbol to this.countrycurrency and logging it.Please note that this code assumes you want to retrieve the currency symbol for the first currency listed in the currencies object. If you want to handle multiple currencies or a different selection logic, you may need to adjust the code accordingly.


  cancel() {
    this.AddbuttonForm = false;
    this.countryForm.reset();
  }

  resetTimer() {
    this.authService.resetInactivityTimer();
  }

}
