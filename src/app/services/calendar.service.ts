import { Injectable } from '@angular/core';
import { Http } from '@capacitor-community/http';
import { AuthService } from './auth.service';
import { MaintenanceEvent } from '../models/maintenance-event.model';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
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
    };

    try {
      const response = await Http.post(options);
      console.log('Event created:', response.data);
      return response.data.id;
    } catch (error) {
      console.error('Error creating event:', error);
      await this.showToast('Failed to create calendar event.');
      return null;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
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
    };

    try {
      await Http.del(options);
      console.log(`Event ${eventId} deleted successfully.`);
      return true;
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      await this.showToast('Failed to delete calendar event.');
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