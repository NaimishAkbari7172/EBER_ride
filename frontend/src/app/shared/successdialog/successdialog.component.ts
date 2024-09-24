import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-successdialog',
  templateUrl: './successdialog.component.html',
  styleUrl: './successdialog.component.css'
})
export class SuccessdialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }
}
