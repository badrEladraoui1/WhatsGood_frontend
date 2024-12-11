import { Component } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { CommonModule } from "@angular/common"; // Add this import

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule], // Add CommonModule here
  templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
  isLoggedIn$ = this.authService.isLoggedIn$;
  currentUser$ = this.authService.currentUser$;

  constructor(private authService: AuthService, private router: Router) {
    // Add this to see what we're getting from the auth response
    this.currentUser$.subscribe((user) => {
      console.log("Current user:", user);
      console.log("Profile picture path:", user?.profilePicture);
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
