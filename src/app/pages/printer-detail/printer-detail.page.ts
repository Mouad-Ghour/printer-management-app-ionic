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

  // Flag to track if the date picker modal is open
  isDatePickerOpen: boolean = false;

  // Subject for debouncing click events
  private datePickerClick$ = new Subject<void>();

  // Importing PRINTER_TYPES
  printerTypes = PRINTER_TYPES;

  // To hold scheduled maintenance events
  scheduledMaintenanceEvents: MaintenanceEvent[] = [];

  constructor(
    private route: ActivatedRoute,
    private printerService: PrinterService,
    private maintenanceService: MaintenanceService,
    private toastController: ToastController,
    private modalController: ModalController,
    private router: Router
  ) {
    // Debounce the date picker click to 300ms
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
        // Deep copy to avoid mutating the original object before save
        this.printer = { ...printerData };
        // Ensure commissioningDate is a Date object
        this.printer.commissioningDate = new Date(this.printer.commissioningDate);

        // Store the original ID
        this.originalId = this.printer.id;

        // Initialize the commissioningDateString
        this.commissioningDateString = this.formatDate(this.printer.commissioningDate);

        // Update imageUrl based on the current printer type
        this.onPrinterTypeChange();

        // Retrieve and display scheduled maintenance events
        this.scheduledMaintenanceEvents = this.maintenanceService.getMaintenanceEventsForPrinter(this.printer.id);
      } else {
        console.error('Printer not found');
      }
    } else {
      console.error('No printer ID provided in route.');
    }
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
    this.maintenanceService.scheduleMaintenance(this.printer);

    // Update the local maintenance events list
    this.scheduledMaintenanceEvents = this.maintenanceService.getMaintenanceEventsForPrinter(this.printer.id);

    const toast = await this.toastController.create({
      message: 'Maintenance scheduled for next Monday from 8 AM to 12 PM.',
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
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
