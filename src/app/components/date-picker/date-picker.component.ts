import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent {
  @Input() selectedDate!: Date;

  constructor(private modalController: ModalController) {}

  onDateChange(event: any) {
    const selectedISODate = event.detail.value;
    this.selectedDate = new Date(selectedISODate);
  }

  async confirm() {
    await this.modalController.dismiss(this.selectedDate);
  }

  async cancel() {
    await this.modalController.dismiss(null);
  }
}
