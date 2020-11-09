import { Component, OnInit } from '@angular/core';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.css'],
})
export class InfoModalComponent implements OnInit {
  authState: Observable<SocialUser>;
  constructor(private authService: SocialAuthService) {
    this.authState = this.authService.authState;
  }

  ngOnInit(): void {}
}
