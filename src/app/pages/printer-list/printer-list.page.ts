// src/app/pages/printer-list/printer-list.page.ts

import { Component, OnInit } from '@angular/core';
import { PrinterService } from '../../services/printer.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { Printer } from '../../models/printer.model';
import { MaintenanceEvent } from '../../models/maintenance-event.model';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastController, AlertController } from '@ionic/angular';

interface PrinterWithMaintenance {
  printer: Printer;
  upcomingMaintenance?: MaintenanceEvent;
}

@Component({
  selector: 'app-printer-list',
  templateUrl: './printer-list.page.html',
  styleUrls: ['./printer-list.page.scss'],
})
export class PrinterListPage implements OnInit {
  sortCriteria: string = 'id'; // Default sorting criteria
  printersWithMaintenance$: Observable<PrinterWithMaintenance[]>;

  constructor(
    private printerService: PrinterService,
    private maintenanceService: MaintenanceService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    // Combine printers and maintenance events
    this.printersWithMaintenance$ = combineLatest([
      this.printerService.getPrinters(),
      this.maintenanceService.getMaintenanceEvents(),
    ]).pipe(
      map(([printers, maintenanceEvents]) => {
        // Map printers with their upcoming maintenance
        let mappedPrinters: PrinterWithMaintenance[] = printers.map(printer => {
          const upcomingEvents = maintenanceEvents
            .filter(event => event.printerId === printer.id)
            .filter(event => event.date >= new Date())
            .sort((a, b) => a.date.getTime() - b.date.getTime());

          return {
            printer,
            upcomingMaintenance: upcomingEvents.length > 0 ? upcomingEvents[0] : undefined,
          };
        });

        // Apply sorting based on sortCriteria
        mappedPrinters = this.sortPrinters(mappedPrinters, this.sortCriteria);

        return mappedPrinters;
      })
    );
  }

  ngOnInit() {}

  /**
   * Sorts the printers based on the selected criteria.
   * @param printers The array of printers with maintenance.
   * @param criteria The criteria to sort by ('id', 'type', 'date').
   * @returns The sorted array of printers.
   */
  private sortPrinters(printers: PrinterWithMaintenance[], criteria: string): PrinterWithMaintenance[] {
    return printers.sort((a, b) => {
      switch (criteria) {
        case 'id':
          return a.printer.id - b.printer.id;
        case 'type':
          return a.printer.type.localeCompare(b.printer.type);
        case 'date':
          if (a.upcomingMaintenance && b.upcomingMaintenance) {
            return a.upcomingMaintenance.date.getTime() - b.upcomingMaintenance.date.getTime();
          } else if (a.upcomingMaintenance) {
            return -1;
          } else if (b.upcomingMaintenance) {
            return 1;
          } else {
            return 0;
          }
        default:
          return 0;
      }
    });
  }

  /**
   * Handler for sorting criteria change.
   */
  onSortCriteriaChange() {
    // Re-fetch and re-sort the printersWithMaintenance$ observable
    this.printersWithMaintenance$ = combineLatest([
      this.printerService.getPrinters(),
      this.maintenanceService.getMaintenanceEvents(),
    ]).pipe(
      map(([printers, maintenanceEvents]) => {
        let mappedPrinters: PrinterWithMaintenance[] = printers.map(printer => {
          const upcomingEvents = maintenanceEvents
            .filter(event => event.printerId === printer.id)
            .filter(event => event.date >= new Date())
            .sort((a, b) => a.date.getTime() - b.date.getTime());

          return {
            printer,
            upcomingMaintenance: upcomingEvents.length > 0 ? upcomingEvents[0] : undefined,
          };
        });

        // Apply sorting based on new sortCriteria
        mappedPrinters = this.sortPrinters(mappedPrinters, this.sortCriteria);

        return mappedPrinters;
      })
    );
  }

  /**
   * Track printers by their unique ID for optimal rendering performance.
   * @param index The index of the item in the list.
   * @param item The printer with maintenance information.
   * @returns The unique ID of the printer.
   */
  trackByPrinterId(index: number, item: PrinterWithMaintenance): number {
    return item.printer.id;
  }

  /**
   * Deletes a maintenance event.
   * @param eventId The ID of the maintenance event to delete.
   */
  async deleteMaintenance(eventId: number) {
    // Confirm deletion with the user
    const confirmed = await this.presentConfirmDialog();
    if (confirmed) {
      this.maintenanceService.deleteMaintenanceEvent(eventId);

      // Show a success toast
      const toast = await this.toastController.create({
        message: 'Maintenance event deleted successfully.',
        duration: 2000,
        position: 'bottom',
        color: 'warning',
      });
      await toast.present();
    }
  }

  /**
   * Presents a confirmation dialog before deletion.
   * @returns A promise that resolves to true if confirmed, false otherwise.
   */
  private async presentConfirmDialog(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Confirm Deletion',
        message: 'Are you sure you want to delete this maintenance event?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              resolve(false);
            },
          },
          {
            text: 'Delete',
            handler: () => {
              resolve(true);
            },
          },
        ],
      });

      await alert.present();
    });
  }
}
