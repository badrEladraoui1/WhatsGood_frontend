import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { RouterOutlet, provideRouter } from "@angular/router";
import { routes } from "./app/app.routes";
import { provideAnimations } from "@angular/platform-browser/animations";
import { NavbarComponent } from "./app/components/navbar/navbar.component";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authInterceptor } from "./app/services/auth.interceptor";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
});
