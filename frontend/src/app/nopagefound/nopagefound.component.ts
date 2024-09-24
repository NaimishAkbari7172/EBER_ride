import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-nopagefound',
  templateUrl: './nopagefound.component.html',
  styleUrl: './nopagefound.component.css'
})
export class NopagefoundComponent {
  constructor(private location:Location){}
  goBack(): void {
    this.location.back();
  }
}
