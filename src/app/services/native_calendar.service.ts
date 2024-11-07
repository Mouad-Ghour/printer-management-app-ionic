
import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { MaintenanceEvent } from '../models/maintenance-event.model';
import { ICalendarService } from './calendar.interface';

declare var window: any;

@Injectable({
  providedIn: 'root',
})
export class NativeCalendarService implements ICalendarService {
  constructor(
    private platform: Platform,
    private toastController: ToastController
  ) {}


  async createEvent(event: MaintenanceEvent): Promise<string | null> {
    await this.platform.ready();
  
    const hasPermission = await this.checkCalendarPermissions();
    if (!hasPermission) {
      await this.showToast('Calendar permissions are required.');
      return null;
    }
  
    const { title, startTime, endTime, printerId } = event;
    const notes = `Maintenance for Printer #${printerId}`;
    const eventLocation = location || 'Default Location';
  
    return new Promise<string | null>((resolve) => {
      window.plugins.calendar.createEvent(
        title,
        "Rouen",
        notes,
        startTime,
        endTime,
        () => {
          console.log('Event created successfully.');
          resolve(title);
        },
        async (error: any) => {
          console.error('Error creating event:', error);
          await this.showToast('Failed to create calendar event.');
          resolve(null);
        }
      );
    });
  }
  

  async deleteEvent(event: MaintenanceEvent): Promise<boolean> {
    await this.platform.ready();
  
    const hasPermission = await this.checkCalendarPermissions();
    if (!hasPermission) {
      await this.showToast('Calendar permissions are required.');
      return false;
    }
  
    const { title, startTime, endTime, printerId } = event;
    const notes = `Maintenance for Printer #${printerId}`;
    const eventLocation = location || 'Default Location';
  
    return new Promise<boolean>((resolve) => {
      window.plugins.calendar.deleteEvent(
        title,
        "Rouen",
        notes,
        startTime,
        endTime,
        () => {
          console.log('Event deleted successfully.');
          resolve(true);
        },
        async (error: any) => {
          console.error('Failed to delete calendar event:', error);
          await this.showToast('Failed to delete calendar event.');
          resolve(false);
        }
      );
    });
  }


  
private async checkCalendarPermissions(): Promise<boolean> {
  if (this.platform.is('android')) {
    return this.checkAndroidPermissions();
  } else if (this.platform.is('ios')) {
    return this.checkIOSPermissions();
  } else {
    // Assume permissions are granted on other platforms
    return true;
  }
}

private async checkAndroidPermissions(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    window.plugins.calendar.hasReadWritePermission(
      (hasPermission: boolean) => {
        if (hasPermission) {
          resolve(true);
        } else {
          window.plugins.calendar.requestReadWritePermission(
            (granted: boolean) => {
              resolve(granted);
            },
            (error: any) => {
              console.error('Permission request error:', error);
              resolve(false);
            }
          );
        }
      },
      (error: any) => {
        console.error('Error checking permissions:', error);
        resolve(false);
      }
    );
  });
}

private async checkIOSPermissions(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    window.plugins.calendar.requestAccessToCalendar(
      (granted: boolean) => {
        resolve(granted);
      },
      (error: any) => {
        console.error('Permission request error:', error);
        resolve(false);
      }
    );
  });
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
