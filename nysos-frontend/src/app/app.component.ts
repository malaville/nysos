import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterListenerService } from './services/router-listener/router-listener.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    private routeListener: RouterListenerService,
    private router: Router
  ) {
    setTimeout(
      () => this.router.navigateByUrl('share/106737924724727700000'),
      2000
    );
  }
}
