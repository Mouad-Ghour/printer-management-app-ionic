import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrinterDetailPageRoutingModule } from './printer-detail-routing.module';

import { PrinterDetailPage } from './printer-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrinterDetailPageRoutingModule
  ],
  declarations: [PrinterDetailPage]
})
export class PrinterDetailPageModule {}
