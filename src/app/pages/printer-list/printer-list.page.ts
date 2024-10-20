import { Component, OnInit } from '@angular/core';
import { PrinterService } from '../../services/printer.service';
import { Printer } from '../../models/printer.model';

@Component({
  selector: 'app-printer-list',
  templateUrl: './printer-list.page.html',
  styleUrls: ['./printer-list.page.scss'],
})
export class PrinterListPage implements OnInit {
  printers: Printer[] = [];
  sortCriteria: string = 'id';

  constructor(private printerService: PrinterService) {}

  ngOnInit() {
    this.printers = this.printerService.getPrinters();
    this.sortPrinters();
  }

  sortPrinters() {
    this.printers = this.printerService.sortPrinters(this.sortCriteria);
  }
}
