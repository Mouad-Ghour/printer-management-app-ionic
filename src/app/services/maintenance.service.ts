import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MaintenanceEvent } from '../models/maintenance-event.model';
import { Printer } from '../models/printer.model';
import { Platform, ToastController } from '@ionic/angular';
import { CalendarService } from '../services/calendar.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  private maintenanceEventsSubject: BehaviorSubject<MaintenanceEvent[]> = new BehaviorSubject<MaintenanceEvent[]>([]);
  private storageKey = 'maintenanceEvents';

  constructor(
    private platform: Platform,
    private toastController: ToastController,
    private calendarService: CalendarService
  ) {
    this.loadEvents();
  }


  async scheduleMaintenance(printer: Printer): Promise<void> {
    
    // Check if an event already exists for this printer
    const existingEvent = this.maintenanceEventsSubject.getValue().find(
      event => event.printerId === printer.id
    );

    if (existingEvent) {
      throw new Error('A maintenance event is already scheduled for this printer.');
    }
    
    const nextMonday = this.getNextMonday();
    const startTime = new Date(nextMonday);
    startTime.setHours(8, 0, 0, 0);

    const endTime = new Date(nextMonday);
    endTime.setHours(12, 0, 0, 0);

    const title = `${printer.type} #${printer.id} Maintenance`;

    const newEvent: MaintenanceEvent = {
      id: this.generateId(),
      printerId: printer.id,
      title,
      date: nextMonday,
      startTime,
      endTime,
      location: 'Your Event Location',
      calendarEventId : null,
    };

    const eventId = await this.calendarService.createEvent(newEvent);
    if (eventId) {
      newEvent.calendarEventId = eventId;
    }else{
      throw new Error('Failed to create calendar event.');
    }

    // Add the event to the local list
    const currentEvents = this.maintenanceEventsSubject.getValue();
    currentEvents.push(newEvent);
    this.maintenanceEventsSubject.next(currentEvents);
    this.saveEvents();
  }
  

  /**
   * Retrieves all maintenance events as an observable.
   */
  getMaintenanceEvents(): Observable<MaintenanceEvent[]> {
    return this.maintenanceEventsSubject.asObservable();
  }

  /**
 * Retrieves maintenance events for a specific printer as an observable.
 * @param printerId The ID of the printer.
 */
  getMaintenanceEventsForPrinter(printerId: number): Observable<MaintenanceEvent[]> {
    return this.maintenanceEventsSubject.asObservable().pipe(
      map(events => events.filter(event => event.printerId === printerId))
    );
  }


  /**
   * Deletes a maintenance event by its ID.
   * @param eventId The ID of the maintenance event to
   * delete.
   * @returns A promise that resolves when the event is deleted.
   * If the event is not found, the promise is rejected.
   * If the event cannot be deleted, the promise is rejected.
   * If the event is deleted successfully, the promise is resolved.
    */  
  async deleteMaintenanceEvent(eventId: number): Promise<void> {
    const currentEvents = this.maintenanceEventsSubject.getValue();
    const index = currentEvents.findIndex(event => event.id === eventId);
    if (index !== -1) {
      const eventToDelete = currentEvents[index];

      console.log('Event to delete:', eventToDelete);

      const success = await this.calendarService.deleteEvent(eventToDelete);
      if (!success) {
        return;
      }

      currentEvents.splice(index, 1);
      this.maintenanceEventsSubject.next(currentEvents);
      this.saveEvents();

      const toast = await this.toastController.create({
        message: 'Maintenance event deleted.',
        duration: 2000,
        position: 'bottom',
        color: 'warning',
      });
      await toast.present();
    } else {
      const toast = await this.toastController.create({
        message: `Maintenance event with ID ${eventId} not found.`,
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      await toast.present();
    }
  }

  /**
   * Loads maintenance events from local storage.
   */
  private loadEvents(): void {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      try {
        const parsedData: any[] = JSON.parse(data);
        const events: MaintenanceEvent[] = parsedData.map(event => ({
          ...event,
          date: new Date(event.date),
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
          calendarEventId: event.calendarEventId || null,
        }));
        this.maintenanceEventsSubject.next(events);
      } catch (error) {
        console.error('Error parsing maintenance events from local storage:', error);
        this.maintenanceEventsSubject.next([]);
      }
    }
  }

  /**
   * Saves maintenance events to local storage.
   */
  private saveEvents(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.maintenanceEventsSubject.getValue()));
  }

  /**
   * Calculates the date of the next Monday.
   * If today is Monday, schedules for the Monday of next week.
   */
  private getNextMonday(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilNextMonday = ((8 - dayOfWeek) % 7) || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday;
  }

  /**
   * Generates a unique ID for a maintenance event.
   */
  private generateId(): number {
    const currentEvents = this.maintenanceEventsSubject.getValue();
    if (currentEvents.length === 0) {
      return 1;
    }
    return Math.max(...currentEvents.map(event => event.id)) + 1;
  }
}





// For later use (google)
  // /**
  //  * Schedules a maintenance event for the given printer.
  //  * @param printer The printer object.
  //  */
  // async scheduleMaintenance(printer: Printer): Promise<void> {
  //   const nextMonday = this.getNextMonday();
  //   const startTime = new Date(nextMonday);
  //   startTime.setHours(8, 0, 0, 0);

  //   const endTime = new Date(nextMonday);
  //   endTime.setHours(12, 0, 0, 0);

  //   const title = `${printer.type} #${printer.id} Maintenance`;

  //   const newEvent: MaintenanceEvent = {
  //     id: this.generateId(),
  //     printerId: printer.id,
  //     title,
  //     date: nextMonday,
  //     startTime,
  //     endTime,
  //     calendarEventId: null,
  //   };
    
    
  //   const eventId = await this.calendarService.createEvent(newEvent);
  //   if (eventId) {
  //     newEvent.calendarEventId = eventId;
  //   } else {
  //     // Event creation failed; throw an error
  //     throw new Error('Failed to create calendar event.');
  //   }

  //   // Add the event to the local list
  //   const currentEvents = this.maintenanceEventsSubject.getValue();
  //   currentEvents.push(newEvent);
  //   this.maintenanceEventsSubject.next(currentEvents);
  //   this.saveEvents();


  //   // // Display success toast (this might be better handled in the component)
  //   // const successToast = await this.toastController.create({
  //   //   message: 'Maintenance event added to Google Calendar.',
  //   //   duration: 2000,
  //   //   position: 'bottom',
  //   //   color: 'success',
  //   // });
  //   // await successToast.present();
  // }

  
  // /**
  //  * Deletes a maintenance event by its ID.
  //  * @param eventId The ID of the maintenance event to delete.
  //  */
  // async deleteMaintenanceEvent(eventId: number): Promise<void> {
  //   const currentEvents = this.maintenanceEventsSubject.getValue();
  //   const index = currentEvents.findIndex(event => event.id === eventId);
  //   if (index !== -1) {
  //     const eventToDelete = currentEvents[index];

  //     if (eventToDelete.calendarEventId) {
  //       const success = await this.calendarService.deleteEvent(eventToDelete.calendarEventId);
  //       if (!success) {
  //         return;
  //       }
  //     }

  //     currentEvents.splice(index, 1);
  //     this.maintenanceEventsSubject.next(currentEvents);
  //     this.saveEvents();

  //     const toast = await this.toastController.create({
  //       message: 'Maintenance event deleted.',
  //       duration: 2000,
  //       position: 'bottom',
  //       color: 'warning',
  //     });
  //     await toast.present();
  //   } else {
  //     const toast = await this.toastController.create({
  //       message: `Maintenance event with ID ${eventId} not found.`,
  //       duration: 2000,
  //       position: 'bottom',
  //       color: 'danger',
  //     });
  //     await toast.present();
  //   }
  // }
