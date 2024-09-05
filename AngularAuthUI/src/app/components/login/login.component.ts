import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ValidateForm from '../../helpers/validateform';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  type: string = "password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";

  username: string = '';
  password: string = '';

  loginForm!: FormGroup;
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    })
  }


  hideShowPass() {
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.type = "text" : this.type = "password";
  }

  onLogin() {
    if (this.loginForm.valid) {

      this.auth.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.auth.setUsername(this.loginForm.get('username')?.value);
          alert(res.message)
          this.loginForm.reset();
          this.router.navigate(['dashboard'])   
        },
        error: (err) => {
          alert(err.error.message)
        }
      })
    } else {

      ValidateForm.validateAllFromFields(this.loginForm);
      //alert("your form is invalid")

    }
  }
}
