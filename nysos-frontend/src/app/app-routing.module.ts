import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImportBibtexButtonComponent } from './interface/source-manager/import-bibtex-button/import-bibtex-button.component';
import { SourceManagerComponent } from './interface/source-manager/source-manager.component';
import { HomeComponent } from './pages/home/home.component';
import { ShareModalComponent } from './pages/home/share-modal/share-modal.component';
import { TestbibtexComponent } from './pages/testbibtex/testbibtex.component';
import { SHARE_PARAM_KEY } from './routingvars';
import { GraphResolver } from './services/resolvers/graph.resolver.service';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    resolve: {
      graphdata: GraphResolver,
    },

    children: [
      {
        path: 'share',
        component: ShareModalComponent,
      },
    ],
  },
  {
    path: 'share/:' + SHARE_PARAM_KEY,
    component: HomeComponent,
    resolve: {
      graphdata: GraphResolver,
    },
  },
  { path: 'testbibtex', component: TestbibtexComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [GraphResolver],
})
export class AppRoutingModule {}
