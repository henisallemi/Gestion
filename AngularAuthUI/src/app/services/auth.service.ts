import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usernameSource = new BehaviorSubject<string | null>(this.getUsernameFromLocalStorage());
  currentUsername = this.usernameSource.asObservable();
  
  private baseUrl: string = "https://localhost:7114/api/User/";

  constructor(private http: HttpClient) { }

  signUp(userObj: any) {
    return this.http.post<any>(`${this.baseUrl}register`, userObj);
  }

  login(loginObj: any) {
    return this.http.post<any>(`${this.baseUrl}authenticate`, loginObj);
  }

  // Set the username in local storage and update the BehaviorSubject
  setUsername(username: string) {
    localStorage.setItem('username', username); // Store username in local storage
    this.usernameSource.next(username);         // Update observable
  }

  // Clear the username from local storage and update the BehaviorSubject
  clearUsername() {
    localStorage.removeItem('username');        // Remove username from local storage
    this.usernameSource.next(null);             // Update observable
  }

  // Retrieve username from local storage
  private getUsernameFromLocalStorage(): string | null {
    return localStorage.getItem('username');
  }
  
}
