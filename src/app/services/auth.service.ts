import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, map, tap } from "rxjs";

export interface AuthResponse {
  token: string;
  username: string;
  id: number;
  profilePicture?: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_URL = "http://localhost:8081/api";
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // Add this line to create the isLoggedIn$ observable
  isLoggedIn$ = this.currentUser$.pipe(map((user) => !!user));

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/login`, {
        username,
        password,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem("currentUser", JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }

  signup(formData: FormData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/signup`, formData)
      .pipe(
        tap((response) => {
          localStorage.setItem("currentUser", JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }

  logout(): void {
    localStorage.removeItem("currentUser");
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.token : null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }
}
