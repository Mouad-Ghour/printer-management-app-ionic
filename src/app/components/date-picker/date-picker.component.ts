import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
})
export class DatePickerComponent {
  @Input() selectedDate!: Date;

  constructor(private modalController: ModalController) {}

  onDateChange(event: any) {
    this.selectedDate = new Date(event.detail.value);
  }

  async confirm() {
    await this.modalController.dismiss(this.selectedDate);
  }

  async cancel() {
    await this.modalController.dismiss(null);
  }
}
