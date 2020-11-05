import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

// Components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DocumentViewerComponent } from './interface/document-viewer/document-viewer.component';
import { SourceManagerComponent } from './interface/source-manager/source-manager.component';
import { BibliographyDetailsComponent } from './interface/document-viewer/bibliography-details/bibliography-details.component';
import { DocumentTitleComponent } from './interface/document-viewer/document-title/document-title.component';
import { BibliographyLinkComponent } from './interface/document-viewer/bibliography-link/bibliography-link.component';
import { UrlValidatorDirective } from './interface/source-manager/url-validator.directive';

// Login
import {
  SocialAuthService,
  GoogleLoginProvider,
  SocialLoginModule,
} from 'angularx-social-login';
import { ContentSaveStateIndicatorComponent } from './interface/content-save-state-indicator/content-save-state-indicator/content-save-state-indicator.component';
import { ContentLoaderComponent } from './interface/document-viewer/content-loader/content-loader.component';
import { GoogleAuthenticationComponent } from './interface/google-authentication/google-authentication.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { GroupingToolComponent } from './interface/grouping-tool/grouping-tool.component';
const config = new SocialAuthService({
  autoLogin: true,
  providers: [
    {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider(
        '474297745605-buejhpmh7r2hpl9mf40l8o519ropn9no.apps.googleusercontent.com'
      ),
    },
  ],
});

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [
    AppComponent,
    DocumentViewerComponent,
    SourceManagerComponent,
    BibliographyDetailsComponent,
    DocumentTitleComponent,
    BibliographyLinkComponent,
    UrlValidatorDirective,
    ContentSaveStateIndicatorComponent,
    ContentLoaderComponent,
    GoogleAuthenticationComponent,
    GroupingToolComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSidenavModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    SocialLoginModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    MatDialogModule,
  ],
  providers: [
    {
      provide: SocialAuthService,
      useFactory: provideConfig,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
