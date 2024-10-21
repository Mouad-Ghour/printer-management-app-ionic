// src/app/services/maintenance.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MaintenanceEvent } from '../models/maintenance-event.model';
import { Printer } from '../models/printer.model';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  private maintenanceEventsSubject: BehaviorSubject<MaintenanceEvent[]> = new BehaviorSubject<MaintenanceEvent[]>([]);
  private storageKey = 'maintenanceEvents';

  constructor() {
    this.loadEvents();
  }

  /**
   * Schedules a maintenance event for the given printer.
   * @param printer The printer object.
   */
  scheduleMaintenance(printer: Printer): void {
    const nextMonday = this.getNextMonday();
    const startTime = new Date(nextMonday);
    startTime.setHours(8, 0, 0, 0); // 8:00 AM

    const endTime = new Date(nextMonday);
    endTime.setHours(12, 0, 0, 0); // 12:00 PM

    const title = `${printer.type} #${printer.id} maintenance.`;

    const newEvent: MaintenanceEvent = {
      id: this.generateId(),
      printerId: printer.id,
      title,
      date: nextMonday,
      startTime,
      endTime,
    };

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
   * Retrieves maintenance events for a specific printer.
   * @param printerId The ID of the printer.
   */
  getMaintenanceEventsForPrinter(printerId: number): MaintenanceEvent[] {
    return this.maintenanceEventsSubject.getValue().filter(event => event.printerId === printerId);
  }

  /**
   * Deletes a maintenance event by its ID.
   * @param eventId The ID of the maintenance event to delete.
   */
  deleteMaintenanceEvent(eventId: number): void {
    const currentEvents = this.maintenanceEventsSubject.getValue();
    const index = currentEvents.findIndex(event => event.id === eventId);
    if (index !== -1) {
      currentEvents.splice(index, 1);
      this.maintenanceEventsSubject.next(currentEvents);
      this.saveEvents();
    } else {
      console.error(`Maintenance event with ID ${eventId} not found.`);
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
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    const daysUntilNextMonday = ((8 - dayOfWeek) % 7) || 7; // Ensures at least 1 day
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);
    nextMonday.setHours(0, 0, 0, 0); // Reset to midnight
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
