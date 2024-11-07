import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrinterService } from '../../services/printer.service';
import { Printer } from '../../models/printer.model';
import { ModalController, ToastController } from '@ionic/angular';
import { DatePickerComponent } from '../../components/date-picker/date-picker.component';
import { MaintenanceService } from '../../services/maintenance.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PRINTER_TYPES } from '../../constants/printer-types.constant';
import { MaintenanceEvent } from '../../models/maintenance-event.model';
import { AuthService } from '../../services/auth.service'; 
import { AlertController } from '@ionic/angular'; 


@Component({
  selector: 'app-printer-detail',
  templateUrl: './printer-detail.page.html',
  styleUrls: ['./printer-detail.page.scss'],
})
export class PrinterDetailPage implements OnInit {
  printerId!: number;
  printer!: Printer;
  originalId!: number;
  commissioningDateString!: string;

  isDatePickerOpen: boolean = false;
  private datePickerClick$ = new Subject<void>();
  printerTypes = PRINTER_TYPES;
  scheduledMaintenanceEvents: MaintenanceEvent[] = [];

  constructor(
    private route: ActivatedRoute,
    private printerService: PrinterService,
    private maintenanceService: MaintenanceService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private router: Router,
    private authService: AuthService,
  ) {
    this.datePickerClick$.pipe(debounceTime(300)).subscribe(() => {
      this.openDatePicker();
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam !== null) {
      this.printerId = +idParam;
      const printerData = this.printerService.getPrinterById(this.printerId);
      if (printerData) {
        this.printer = { ...printerData };
        this.printer.commissioningDate = new Date(this.printer.commissioningDate);
        this.originalId = this.printer.id;
        this.commissioningDateString = this.formatDate(this.printer.commissioningDate);
        this.onPrinterTypeChange();
        this.loadScheduledMaintenance();
      } else {
        console.error('Printer not found');
      }
    } else {
      console.error('No printer ID provided in route.');
    }
  }


  loadScheduledMaintenance() {
    this.maintenanceService.getMaintenanceEventsForPrinter(this.printer.id)
      .subscribe(events => {
        this.scheduledMaintenanceEvents = events;
      });
  }


  onPrinterTypeChange() {
    this.printer.imageUrl = this.printerService.getImageUrlForType(this.printer.type);
  }


  onDateChange(event: any) {
    this.printer.commissioningDate = new Date(event.detail.value);
  }

  formatDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  parseDate(dateString: string): Date {
    // Parsing dateString in DD/MM/YYYY format
    const [day, month, year] = dateString.split('/');
    return new Date(+year, +month - 1, +day);
  }

  onDateInputClick() {
    this.datePickerClick$.next();
  }

  async openDatePicker() {
    // Check if the modal is already open
    if (this.isDatePickerOpen) {
      return;
    }

    this.isDatePickerOpen = true;

    const modal = await this.modalController.create({
      component: DatePickerComponent,
      componentProps: {
        selectedDate: this.printer.commissioningDate,
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.printer.commissioningDate = data.data;
        this.commissioningDateString = this.formatDate(this.printer.commissioningDate);
      }
      this.isDatePickerOpen = false;
    });

    return await modal.present();
  }

  /**
   * Saves the printer details and shows a confirmation toast.
   */
  async savePrinter() {
    this.printerService.updatePrinter(this.originalId, this.printer);

    const toast = await this.toastController.create({
      message: 'Printer details updated successfully.',
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();

    // Optionally, navigate back to the printer list
    this.router.navigate(['/printer-list']);
  }

  /**
   * Saves the printer details and navigates back to the printer list.
   */
  async saveAndReturn() {
    await this.savePrinter();
    this.router.navigate(['/printer-list']);
  }

  /**
   * Schedules a maintenance event for the next Monday from 8 AM to 12 PM.
   */

  async scheduleMaintenance() {
    try {
      await this.maintenanceService.scheduleMaintenance(this.printer);
  
      // Update the local maintenance events list
      this.loadScheduledMaintenance();
  
      const toast = await this.toastController.create({
        message: 'Maintenance scheduled and added to the Calendar.',
        duration: 2000,
        position: 'bottom',
        color: 'success',
      });
      await toast.present();
    } catch (error) {
      // Handle the case when an event already exists
      if (error instanceof Error && error.message.includes('already scheduled')) {
        const alert = await this.alertController.create({
          header: 'Event Already Scheduled',
          message: 'A maintenance event is already scheduled for this printer.',
          buttons: ['OK'],
        });
        await alert.present();
      } else {
        // Display a general error toast
        const toast = await this.toastController.create({
          message: 'Failed to schedule maintenance.',
          duration: 2000,
          position: 'bottom',
          color: 'danger',
        });
        await toast.present();
      }
    }
  }


  /**
   * Deletes a maintenance event.
   * @param eventId The ID of the maintenance event to delete.
   */
  async deleteMaintenance(eventId: number) {
    // Confirm deletion with the user
    const confirmed = await this.presentConfirmDialog();
    if (confirmed) {
      await this.maintenanceService.deleteMaintenanceEvent(eventId);

      // Update the local maintenance events list
      this.loadScheduledMaintenance();

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

  /**
   * Optional: Navigate back to the printer list without saving.
   */
  cancel() {
    this.router.navigate(['/printer-list']);
  }

  /**
   * Optional: Present a toast with a custom message and color.
   * @param message The message to display.
   * @param color The color of the toast.
   */
  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
