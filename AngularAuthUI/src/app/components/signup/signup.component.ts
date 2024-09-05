
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar'; // Import du MatSnackBar
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import validateForm from '../../helpers/validateform';
 
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  type: string = "password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";

  signUpFrom!: FormGroup;

  constructor(private fb: FormBuilder, 
              private auth: AuthService, 
              private router: Router,
              private snackBar: MatSnackBar) { } // Injection du MatSnackBar

  ngOnInit(): void {
    this.signUpFrom = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required], 
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],    
      password: ['', Validators.required],
    });
  }

  hideShowPass() {
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.type = "text" : this.type = "password";
  }

  onSignup() {
    if (this.signUpFrom.valid) {
      this.auth.signUp(this.signUpFrom.value).subscribe({
        next: (res) => {
          this.snackBar.open(res.message, 'Close', { duration: 4500 }); // Affichage du message via MatSnackBar
          this.signUpFrom.reset();
          this.router.navigate(['login']);
        },
        error: (err) => {
          this.snackBar.open(err.error.message, 'Close', { duration: 8000, panelClass: ['error-snackbar'] }); // Affichage du message d'erreur
        }   
      }); 

    } else {
       validateForm.validateAllFromFields(this.signUpFrom);
}
  }
}
 