import { Injectable } from '@angular/core';
import { Http } from '@capacitor-community/http';
import { AuthService } from './auth.service';
import { MaintenanceEvent } from '../models/maintenance-event.model';
import { ToastController } from '@ionic/angular';
import { ICalendarService } from './calendar.interface';

@Injectable({
  providedIn: 'root',
})
export class GoogleCalendarService implements ICalendarService {
  constructor(
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  async createEvent(event: MaintenanceEvent): Promise<string | null> {
    let accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      accessToken = await this.authService.signIn();
      if (!accessToken) {
        return null;
      }
    }
  
    const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
  
    const eventDetails = {
      summary: event.title,
      description: `Maintenance for Printer #${event.printerId}`,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };
  
    const options = {
      url,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: eventDetails,
      params: {},
    };
  
    try {
      const response = await Http.post(options);
      console.log('Event created:', response.data);
      return response.data.id;
    } catch (error: any) {
      console.error('Error creating event:', error);
      await this.showToast(`Failed to create calendar event: ${error.message || error}`);
      return null;
    }
  }


  async deleteEvent(event: MaintenanceEvent): Promise<boolean> {
    const eventId = event.calendarEventId;
    if (!eventId) {
      await this.showToast('Event ID not found.');
      return false;
    }
  
    let accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      accessToken = await this.authService.signIn();
      if (!accessToken) {
        return false;
      }
    }
  
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
  
    const options = {
      url,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {},
    };
  
    try {
      await Http.del(options);
      console.log(`Event ${eventId} deleted successfully.`);
      return true;
    } catch (error: any) {
      console.error('Failed to delete calendar event:', error);
      await this.showToast(`Failed to delete calendar event: ${error.message || error}`);
      return false;
    }
  }
  
  

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }
}
