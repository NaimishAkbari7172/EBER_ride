import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private authService: AuthService, private router: Router){}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      // If logged in, navigate to the dashboard or another protected route
      this.router.navigate(['/app']);
    } else {
      // Otherwise, navigate to the login page
      this.router.navigate(['/login']);
    }
  }

}
