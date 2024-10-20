import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'printer-list',
    pathMatch: 'full',
  },
  {
    path: 'printer-list',
    loadChildren: () =>
      import('./pages/printer-list/printer-list.module').then(
        (m) => m.PrinterListPageModule
      ),
  },
  {
    path: 'printer-detail/:id',
    loadChildren: () =>
      import('./pages/printer-detail/printer-detail.module').then(
        (m) => m.PrinterDetailPageModule
      ),
  },
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
