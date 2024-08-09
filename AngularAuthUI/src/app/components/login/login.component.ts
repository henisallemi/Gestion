import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ValidateForm from '../../helpers/validateform';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CoreService } from '../../services/core.service'; // Import CoreService

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // Corrected styleUrl to styleUrls
})
export class LoginComponent implements OnInit { // Implement OnInit
  type: string = "password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";

  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private coreService: CoreService // Inject CoreService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  hideShowPass() {
    this.isText = !this.isText;
    this.eyeIcon = this.isText ? "fa-eye" : "fa-eye-slash";
    this.type = this.isText ? "text" : "password";
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.auth.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.coreService.openSnackBar(res.message); // Replace alert with openSnackBar
          this.loginForm.reset();
          this.router.navigate(['dashboard']);
        }, 
        error: (err) => {
          this.coreService.openSnackBar(err.error.message); // Replace alert with openSnackBar
        }
      }); 
    } else {
      ValidateForm.validateAllFromFields(this.loginForm); // Use correct method name
      this.coreService.openSnackBar("Your form is invalid"); // Replace alert with openSnackBar
    }
  }
}
