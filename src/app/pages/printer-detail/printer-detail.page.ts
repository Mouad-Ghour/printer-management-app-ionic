import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrinterService } from '../../services/printer.service';
import { Printer } from '../../models/printer.model';
import { ModalController, ToastController } from '@ionic/angular';
import { DatePickerComponent } from '../../components/date-picker/date-picker.component';

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

  constructor(
    private route: ActivatedRoute,
    private printerService: PrinterService,
    private toastController: ToastController,
    private modalController: ModalController,
    private router: Router
  ) {}

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
    // const [day, month, year] = dateString.split('/');
    // return new Date(+year, +month - 1, +day);
    return new Date(dateString);
  }
  
  async openDatePicker() {
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
    });
  
    return await modal.present();
  }

  async savePrinter() {
    this.printerService.updatePrinter(this.originalId, this.printer);

    const toast = await this.toastController.create({
      message: 'Printer details updated successfully.',
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();

    // Optionally, navigate back to the printer list
    this.router.navigate(['/printer-list']);
  }

  async saveAndReturn() {
    await this.savePrinter();
    this.router.navigate(['/printer-list']);
  }

  scheduleMaintenance() {
    // To be implemented in Part 3
  }
}
