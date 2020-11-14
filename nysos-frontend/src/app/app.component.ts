import { Component } from '@angular/core';
import { RouterListenerService } from './services/router-listener/router-listener.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private routeListener: RouterListenerService) {}
}
