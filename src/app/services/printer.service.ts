import { Injectable } from '@angular/core';
import { Printer } from '../models/printer.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  private printersSubject: BehaviorSubject<Printer[]> = new BehaviorSubject<Printer[]>([
    // Initialize with your printers data
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
    // Add more printers as needed
  ]);

  constructor() {}

  getPrinters(): Observable<Printer[]> {
    return this.printersSubject.asObservable();
  }

  getCurrentPrinters(): Printer[] {
    return this.printersSubject.getValue();
  }

  getPrinterById(id: number): Printer | undefined {
    return this.getCurrentPrinters().find((printer) => printer.id === id);
  }  

  getImageUrlForType(printerType: string): string {
    switch (printerType) {
      case 'Powder printer':
        return 'assets/images/powder-printer.png';
      case 'Wire printer':
        return 'assets/images/wire-printer.png';
      case 'Resin printer':
        return 'assets/images/resin-printer.png';
      // Add more cases for additional printer types
      default:
        return 'assets/images/powder-printer.png'; // A default image
    }
  }
  

  updatePrinter(originalId: number, updatedPrinter: Printer): void {
    const printers = this.getCurrentPrinters();
    const index = printers.findIndex((printer) => printer.id === originalId);
    if (index !== -1) {
      printers[index] = { ...updatedPrinter };
      this.printersSubject.next(printers);
    } else {
      console.error(`Printer with ID ${originalId} not found.`);
    }
  }
  
}
