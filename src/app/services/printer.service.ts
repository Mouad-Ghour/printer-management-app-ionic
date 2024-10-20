import { Injectable } from '@angular/core';
import { Printer } from '../models/printer.model';

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  private printers: Printer[] = [
    {
      id: 12,
      type: 'Powder printer',
      commissioningDate: new Date('2021-01-15'),
      imageUrl: 'assets/images/powder-printer.png',
    },
    {
      id: 17,
      type: 'Wire printer',
      commissioningDate: new Date('2020-05-20'),
      imageUrl: 'assets/images/wire-printer.png',
    },
    {
      id: 22,
      type: 'Resin printer',
      commissioningDate: new Date('2019-08-10'),
      imageUrl: 'assets/images/resin-printer.png',
    },
    // Add more printers, alternating types
  ];

  getPrinters(): Printer[] {
    return this.printers;
  }

  sortPrinters(criteria: string): Printer[] {
    return this.printers.sort((a, b) => {
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
}
