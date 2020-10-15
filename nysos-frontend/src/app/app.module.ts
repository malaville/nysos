import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';

// Components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DocumentViewerComponent } from './interface/document-viewer/document-viewer.component';
import { SourceManagerComponent } from './interface/source-manager/source-manager.component';
import { BibliographyDetailsComponent } from './interface/document-viewer/bibliography-details/bibliography-details.component';
import { DocumentTitleComponent } from './interface/document-viewer/document-title/document-title.component';

@NgModule({
  declarations: [
    AppComponent,
    DocumentViewerComponent,
    SourceManagerComponent,
    BibliographyDetailsComponent,
    DocumentTitleComponent,
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
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
