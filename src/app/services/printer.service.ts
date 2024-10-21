import { Injectable } from '@angular/core';
import { Printer } from '../models/printer.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { PrinterType } from '../constants/printer-types.enum'; // Import Enum
import { PRINTER_TYPES } from '../constants/printer-types.constant';

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  private printersSubject: BehaviorSubject<Printer[]> = new BehaviorSubject<Printer[]>([
    {
      id: 12,
      type: PRINTER_TYPES[0], 
      commissioningDate: new Date('2021-01-15'),
      imageUrl: 'assets/images/powder-printer.png',
    },
    {
      id: 17,
      type: PRINTER_TYPES[1],
      commissioningDate: new Date('2020-05-20'),
      imageUrl: 'assets/images/wire-printer.png',
    },
    {
      id: 22,
      type: PRINTER_TYPES[2],
      commissioningDate: new Date('2019-08-10'),
      imageUrl: 'assets/images/resin-printer.png',
    },
    // Add more printers as needed, using PRINTER_TYPES
  ]);

  constructor() {}

  /**
   * Retrieves the list of printers as an observable.
   */
  getPrinters(): Observable<Printer[]> {
    return this.printersSubject.asObservable();
  }

   /**
   * Retrieves the current list of printers as a plain array.
   */
  getCurrentPrinters(): Printer[] {
    return this.printersSubject.getValue();
  }

  /**
   * Retrieves a printer by its ID.
   * @param id The ID of the printer.
   * @returns The printer object if found, otherwise undefined.
   */
  getPrinterById(id: number): Printer | undefined {
    return this.getCurrentPrinters().find((printer) => printer.id === id);
  }


  /**
   * Retrieves the image URL based on the printer type.
   * Utilizes the PRINTER_TYPES constant to ensure consistency.
   * @param printerType The type of the printer.
   * @returns The corresponding image URL.
   */
  getImageUrlForType(printerType: PrinterType): string {
    switch (printerType) {
      case PrinterType.Powder:
        return 'assets/images/powder-printer.png';
      case PrinterType.Wire:
        return 'assets/images/wire-printer.png';
      case PrinterType.Resin:
        return 'assets/images/resin-printer.png';
      default:
        return 'assets/images/default-printer.png';
    }
  }
  

     /**
     * Updates a printer's details.
     * Ensures that the updated type is one of the PRINTER_TYPES.
     * @param originalId The original ID of the printer.
     * @param updatedPrinter The printer object with updated details.
     */
  updatePrinter(originalId: number, updatedPrinter: Printer): void {
    // Validate that the updated type exists in PRINTER_TYPES
    if (!PRINTER_TYPES.includes(updatedPrinter.type)) {
      console.error(`Invalid printer type: ${updatedPrinter.type}`);
      return;
    }

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