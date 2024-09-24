import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrwrapperService } from '../../services/toastrwrapper.service';
import { CityService } from '../../services/city.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrl: './city.component.css'
})
export class CityComponent implements OnInit{

  // @ViewChild('search') searchElementRef!: ElementRef;

  cityForm!: FormGroup;
  addedCities: string[] = [];
  newCity: string = "";
  isValidCity: boolean = false;
  isDuplicateCity: boolean = false;

  //map
  map: any;
  drawingManager: any;
  polygons: any = [];
  isInZone: boolean = false;
  cordsArray: any = [];
  marker: any;
  autocomplete!: google.maps.places.Autocomplete;

  //get country data
  selectedCountry: string = "";
  selectedCountryName!: string;
  countryData: any[] = [];
  cityData: any[] = [];

  countries: any;
  coordinates: any;
  inputValue: any;
  isaddbutton: boolean = true;
  isupdatebutton: boolean = false;
  isCountryDisabled: boolean = false;
  id: any;
  page: number =1;
  tableSize: any;
  countryName: any;
  city: any;
  citydata: any = {
    countryname: "",
    cityname: "",
  };
  polygonObj: any;
  polygon: any;
  totalPages: number = 0;
  limit: number = 5;
  currentPage: number = 1;
  paginatedData: any[] = [];
  count: any;
  
  constructor(
    private toastr1: ToastrwrapperService,
    private cityservice: CityService,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private authService: AuthService,

  ) {
    this.cityForm = this.formBuilder.group({
      countryname: ["", Validators.required],
      cityname: ["", Validators.required]
    });
  }

  ngOnInit(): void {
    this.cityForm = this.formBuilder.group({
      countryname: [""],
      cityname: [""],
    });
    this.getCItyData();
    this.getCountryNamefromDB();
    this.initMap();
    this.initializeAutocomplete();
  }


  //--------------------------------SELECT COUNTRY FROM DROPDOWzN---------------------------------------------//
  initializeAutocomplete() {
    const autocompleteOptions = {
      types: ['(cities)']
    };
  }
  
  onSelected(id: any) {
    this.removePolygon() 
    this.selectedCountry = id;
    // console.log(id);
    const selectedCountryObj = this.countryData.find((obj: any) => obj._id === id);
    if (selectedCountryObj) {
      this.selectedCountryName = selectedCountryObj.countryName;
    
    // console.log(this.selectedCountryName);

    this.cityservice.getCityPolygons(id).subscribe({
      next: (response: any) => {
        // console.log(response);
        const cityDataArray = response.citydata;

        if (Array.isArray(cityDataArray)) {
          cityDataArray.forEach((element: any) => {
          this.polygons.push(element.coordinates);
          });
          // console.log(this.polygon);
          this.polygonObj = this.polygons.map((polygonCoordinates: any) => {
            return new google.maps.Polygon({

              paths: polygonCoordinates,
              editable: false,
              draggable: false,
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#FF0000",
              fillOpacity: 0.35,
              map: this.map,
            });
          });
        }else {
          console.log("Expected an array but got:", cityDataArray);
        }
      },
    });

      //-------------- city Autocomplete based on selected country from onSelected(country's Id).............
      this.http.get<any>(`https://restcountries.com/v3.1/name/${this.selectedCountryName}`)
        .subscribe({
          next: (countryRes: any) => {
            let rcountry = countryRes.filter((obj: any) => {
              return obj.name.common == this.selectedCountryName;
            });

            if (rcountry.length > 0) {
              //getting country code like IN..............
              let code = rcountry[0].cca2.toLowerCase();

              this.autocomplete.setTypes(["(cities)"]);
              this.autocomplete.setComponentRestrictions({ country: [code] });
            }else{
              console.error('Country not found');
            }
          },
          error: (error: any) => {
            console.log("Country Selection Error: ", error.message);
            // this.toastr.showError(error.message);
          },
        });
    }
  }


  // To set the Location of searched from Input field and modify it..........
  setLocation(place: any) {
    if (!place.geometry) {
      console.error("No geometry found for place:", place);
      return;
    }

    if (place.geometry && place.geometry.location) {
      this.map.setCenter(place.geometry.location);
      this.map.setZoom(8);
      this.marker.setPosition(place.geometry.location);
      this.marker.setVisible(true);
    }
  }

  onPlaceChanged() {
    const place = this.autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      // Do something with the latitude and longitude
      console.log("Latitude:", lat);
      console.log("Longitude:", lng);
    } 
  }

  // To load the map on Screen..................................................................


  initMap() { 
    this.map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 4,
      }
    );

    const input = document.getElementById("inputCity") as HTMLInputElement;
    this.autocomplete = new google.maps.places.Autocomplete(input);

    this.autocomplete.addListener("place_changed", () => {
      const place: any = this.autocomplete.getPlace();
      this.onPlaceChanged(); //place change in select.
      this.setLocation(place); // set location in search.
    });

    // Add Location Marker or Pin on the searched location..............

    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      anchorPoint: new google.maps.Point(0, -29),
    });

    // to draw the polygon on the map using DrawingManager()............
    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON],
      },
    });

    this.drawingManager.setMap(this.map);

    google.maps.event.addListener(
      this.drawingManager,
      "overlaycomplete",
      (event: any) => {
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          if (this.polygon) {
            this.polygon.setMap(null); //clearing old drawn polygon
          }
          this.polygon = event.overlay;
        }
      }
    );

    // Add event listener for polygon drag end

    if(this.polygon){
      google.maps.event.addListener(this.polygon, "dragend", (event: any) => {
        const newCoordinates = this.polygon
          .getPath()
          .getArray()
          .map((results: { lat: () => any; lng: () => any }) => ({
            lat: results.lat(),
            lng: results.lng(),
          }));
        // Do something with the updated coordinates
        console.log("Updated Coordinates:", newCoordinates);
      });
    }else{
      console.error("this.polygon is undefined");
    }
  }

  // To fetch country data from from /countrydata API in dropdown..........
  getCountryNamefromDB(): void {
    this.cityservice.getcountrydata().subscribe({
      next: (response) => {
        // console.log(response);
        this.countryData = response.countrydata;
      },
      error: (error) => {
        console.log(error)
        // this.toastr.error(error);
      },
    });
  }

  //---------------------------------------GET CITY DATA------------------------------------------//
  getCItyData(): void {
    this.cityservice.getcity(this.currentPage, this.limit).subscribe({
      next: (response) => {
        // console.log(response.citydata)
        this.cityData = response.citydata;
        this.count = response.count;
        this.totalPages = response.totalPage;
      },
      error: (error) => {
        // this.toastr.error(error);
        console.log(error)
      },
    });
  }
  onPageSizeChange(event: any): void {
    this.limit = parseInt(event.target.value);
    this.currentPage = 1;
    this.updatePaginatedData();
    this.getCItyData();
  }
  onPageChange(pageNumber: number) {
    console.log(pageNumber)
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePaginatedData();
      this.getCItyData();
    }
  }

  getPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  }
  
  updatePaginatedData() {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.paginatedData = this.cityData.slice(startIndex, endIndex);
  }
  //------TO REMOVE POLYGON-----------------//
  removePolygon() {
    if(this.polygonObj){
      this.polygonObj.forEach((element: any) => {
        element.setMap(null);
      },
      this.polygonObj = [],
      this.polygons = []
      );
    }
  }

  // To check the drawn Zone inside coordinates or not and add city in database.............
  checkZone_AddCity() {
      if(this.cityForm.value.countryname != ""){
      
        const geocoder = new google.maps.Geocoder();
    
        const input = document.getElementById("inputCity") as HTMLInputElement;
    
        
        geocoder.geocode({ address: input.value }, (results: any, status: any) => {
          if (status === "OK") {
            console.log(4)
            const location = results[0].geometry.location;
            // console.log(location)
            if (this.polygon && google.maps.geometry.poly) {
              console.log(5)

              this.isInZone = google.maps.geometry.poly.containsLocation(
                location,
                this.polygon
              );

              if (this.isInZone == true) {
                const polygonPath = this.polygon.getPath();
                this.coordinates = polygonPath
                  .getArray()
                  .map((results: google.maps.LatLng) => ({
                    lat: results.lat(),
                    lng: results.lng(),
                  }));
                console.log("Coordinates:", this.coordinates);

                const payload = {
                  countryId: this.selectedCountry,
                  city: input.value,
                  coordinates: this.coordinates,
                };
                console.log(payload);

                // To add city in Database...............
                this.cityservice.addcity(payload).subscribe({
                  next: (response: any) => {
                    console.log(response)
                    this.cityData.push(response.city);
                    this.toastr1.showSuccess(response.message);
                    // alert(response.message);
                    this.getCItyData();
                    this.getCountryNamefromDB();
                    this.marker.setVisible(false); // Hide the marker
                    this.marker.setPosition(null); // Clear the marker position
                    this.polygon.setMap(null); // clear the polygon
                    this.cityForm.reset(); // clear the form
                  },
                  error: (error) => {
                    console.log(error.error.message);
                    // this.toastr.warning(error.error.message);
                  },
                });
              } else {
                this.toastr1.showWarning("Location not Inside Zone");
              }
            }else{
              this.toastr1.showWarning("Polygon or geometry library is not defined.");
            }
          } else {
            this.toastr1.showWarning("please choose city and create a zone");
          }
        });
      } else {
        this.toastr1.showWarning("All Fields are Required");
      }
    }



  editbtn(_id: string, city: any) {
    this.removePolygon() 

    console.log(city);
    this.id = _id;
    this.inputValue = city.city;
    this.selectedCountryName = city.countryDetails.countryName;

    this.cityForm.get("countryname")?.disable();
    // this.cityForm.get("cityname")?.disable();

    this.cityForm.patchValue({
      countryname: city.countryDetails._id,
      cityname: city.city,
    });

    // Enable the update button and disable the add button
    this.isaddbutton = false;
    this.isupdatebutton = true;

    const coordinatesdatabase = city.coordinates;
    console.log(coordinatesdatabase);

    this.displayPolygon(city.coordinates);
  }

  displayPolygon(coordinates: any[]) {
    const polygonPath = coordinates.map(
      (coord: any) => new google.maps.LatLng(coord.lat, coord.lng)
    );

    // Remove previous polygon if exists
    if (this.polygon) {
      this.polygon.setMap(null);
    }

    // Create and display the polygon
    this.polygon = new google.maps.Polygon({
      paths: polygonPath,
      editable: true,
      draggable: true,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
    });
    this.polygon.setMap(this.map);

    //to Zoom the selected location inside zone.............
    const bounds = new google.maps.LatLngBounds();
    coordinates.forEach((coord: any) => {
      bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
    });
    this.map.fitBounds(bounds);
  }

  updateCity() {
    const geocoder = new google.maps.Geocoder();
    const input = document.getElementById("inputCity") as HTMLInputElement;

    geocoder.geocode({ address: input.value }, (results: any, status: any) => {
      if (status === "OK") {
        const location = results[0].geometry.location;
        console.log(location)
        this.isInZone = google.maps.geometry.poly.containsLocation(
          location,
          this.polygon
        );

        if (this.isInZone == true && input.value != "") {
          const newCoordinates = this.polygon
          .getPath()
          .getArray()
          .map((results: { lat: () => any; lng: () => any }) => ({
            lat: results.lat(),
            lng: results.lng(),
          }));
        console.log(newCoordinates);

          const payload = {
            city: input.value,
            coordinates: newCoordinates,
          };
          console.log(payload);

          this.cityservice.updateCity(this.id, payload).subscribe({
            next: (response: any) => {
              console.log(response);
              this.toastr1.showInfo(response.message);
              this.cityData.push(response.city);

              // Reset the form and button states
              this.isupdatebutton = false;
              this.isaddbutton = true;
              this.cityForm.get('countryname')?.enable();
              
              this.getCItyData();
              this.getCountryNamefromDB();
              this.marker.setVisible(false);
              this.marker.setPosition(null); 
              this.polygon.setMap(null); 
              this.cityForm.reset(); 
            },
            error: (error) => {
              console.log(error.error.message);
              // this.toastr.warning(error.error.message);
            },
          });
        } else {
          this.toastr1.showWarning("Location not Inside Zone");
        }
      } else {
        this.toastr1.showWarning("please choose city and create a zone");
      }
    });

  }


  resetTimer() {
    this.authService.resetInactivityTimer();
  }
}
