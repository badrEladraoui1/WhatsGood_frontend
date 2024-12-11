import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./signup.component.html",
})
export class SignupComponent {
  signupForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ["", Validators.required],
      password: ["", [Validators.required, Validators.minLength(6)]],
      profilePicture: [null],
    });

    if (this.authService.isLoggedIn()) {
      this.router.navigate(["/chat"]);
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      const formData = new FormData();
      formData.append("username", this.signupForm.get("username")?.value);
      formData.append("password", this.signupForm.get("password")?.value);

      if (this.selectedFile) {
        formData.append("profilePicture", this.selectedFile);
      }

      this.authService.signup(formData).subscribe({
        next: () => {
          this.router.navigate(["/login"]);
        },
        error: (error) => {
          console.error("Signup failed:", error);
        },
      });
    }
  }
}
