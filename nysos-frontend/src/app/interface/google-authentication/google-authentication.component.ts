import { Component, OnInit } from '@angular/core';
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser,
} from 'angularx-social-login';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-google-authentication',
  templateUrl: './google-authentication.component.html',
  styleUrls: ['./google-authentication.component.css'],
})
export class GoogleAuthenticationComponent implements OnInit {
  auth: Observable<SocialUser>;
  token: string;
  authServiceInitialized: Observable<boolean>;
  loginIn: boolean;

  constructor(private authService: SocialAuthService) {}

  ngOnInit(): void {
    this.authServiceInitialized = this.authService.initState;
    this.auth = this.authService.authState;
  }

  signInWithGoogle() {
    this.loginIn = true;
    this.authService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .finally(() => (this.loginIn = false));
  }
}
