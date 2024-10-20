import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrinterService } from '../../services/printer.service';
import { Printer } from '../../models/printer.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-printer-list',
  templateUrl: './printer-list.page.html',
  styleUrls: ['./printer-list.page.scss'],
})
export class PrinterListPage implements OnInit, OnDestroy {
  printers: Printer[] = [];
  sortCriteria: string = 'id';
  printersSubscription!: Subscription;

  constructor(private printerService: PrinterService) {}

  ngOnInit() {
    this.printersSubscription = this.printerService.getPrinters().subscribe((printers) => {
      this.printers = this.sortPrinters(printers, this.sortCriteria);
    });
  }

  ngOnDestroy() {
    if (this.printersSubscription) {
      this.printersSubscription.unsubscribe();
    }
  }

  sortPrinters(printers: Printer[], criteria: string): Printer[] {
    return printers.sort((a, b) => {
      if (criteria === 'id') {
        return a.id - b.id;
      } else if (criteria === 'type') {
        return a.type.localeCompare(b.type);
      } else if (criteria === 'date') {
        return a.commissioningDate.getTime() - b.commissioningDate.getTime();
      } else {
        return 0;
      }
    });
  }

  onSortCriteriaChange() {
    this.printers = this.sortPrinters(this.printers, this.sortCriteria);
  }
}
