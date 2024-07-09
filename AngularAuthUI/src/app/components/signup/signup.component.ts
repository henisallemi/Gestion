import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { last } from 'rxjs';
import validateForm from '../../helpers/validateform';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  type: string = "password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";

  signUpFrom!: FormGroup;
  constructor(private fb: FormBuilder, private auth: AuthService, private router:Router) { }
  ngOnInit(): void {
    this.signUpFrom = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required], 
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
    })
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
          alert(res.message);
          this.signUpFrom.reset();
          this.router.navigate(['login']);
        },
        error: (err) => {
          alert(err.error.message)

        } 
      })

    } else {
      validateForm.validateAllFromFields(this.signUpFrom);
      alert("your form is invalid")
    }
  }



}
