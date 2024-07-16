import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(private _snackBar: MatSnackBar) { }

  openSnackBar(message: string, action: string = "ok", duration: number = 3000) {
    this._snackBar.open(message, action, {
      duration: duration,
      verticalPosition: 'top', 
    });
  }
}
