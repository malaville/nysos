import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { ShareModalComponent } from './pages/home/share-modal/share-modal.component';
import { GraphResolver } from './services/resolvers/graph.resolver.service';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,

    children: [
      {
        path: 'share',
        component: ShareModalComponent,
      },
    ],
  },
  {
    path: 'share/:shareid',
    component: HomeComponent,
    resolve: {
      graphdata: GraphResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [GraphResolver],
})
export class AppRoutingModule {}
