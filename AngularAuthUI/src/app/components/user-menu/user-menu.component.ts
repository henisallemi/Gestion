import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
})
export class UserMenuComponent {
  
  @Input() username: string | null = ''; // Input to receive the username
  @Output() logout = new EventEmitter<void>(); // Output to emit the logout event

  onLogout() {
    this.logout.emit(); // Emit the logout event to the parent component
  }
}
