// src/services/calendar.service.ts

import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ICalendarService } from './calendar.interface';
import { GoogleCalendarService } from '../services/google_calendar.service';
import { NativeCalendarService } from '../services/native_calendar.service';
import { MaintenanceEvent } from '../models/maintenance-event.model';

@Injectable({
  providedIn: 'root',
})
export class CalendarService implements ICalendarService {
  private calendarImplementation: ICalendarService;

  constructor(
    private platform: Platform,
    private googleCalendarService: GoogleCalendarService,
    private nativeCalendarService: NativeCalendarService
  ) {
    if (this.platform.is('ios') || this.platform.is('android')) {
      // Use Native Calendar on mobile devices
      this.calendarImplementation = this.nativeCalendarService;
    } else {
      // Use Google Calendar on web
      this.calendarImplementation = this.googleCalendarService;
    }
  }

  createEvent(event: MaintenanceEvent): Promise<string | null> {
    return this.calendarImplementation.createEvent(event);
  }

  deleteEvent(event: MaintenanceEvent): Promise<boolean> {
    return this.calendarImplementation.deleteEvent(event);
  }
}
