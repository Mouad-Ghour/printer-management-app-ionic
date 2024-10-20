import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrinterDetailPage } from './printer-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PrinterDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrinterDetailPageRoutingModule {}
