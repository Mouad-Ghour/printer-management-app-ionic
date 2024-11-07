// src/typings/cordova-plugin-calendar.d.ts

interface CalendarOptions {
    firstReminderMinutes?: number;
    secondReminderMinutes?: number;
    recurrence?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurrenceEndDate?: Date;
    recurrenceInterval?: number;
    calendarName?: string;
    calendarId?: number;
    url?: string;
    id?: string;
  }
  
  interface CalendarPlugin {
    createEvent(
      title: string,
      location: string,
      notes: string,
      startDate: Date,
      endDate: Date,
      successCallback?: (message: any) => void,
      errorCallback?: (error: any) => void
    ): void;
  
    createEventWithOptions(
      title: string,
      location: string,
      notes: string,
      startDate: Date,
      endDate: Date,
      options: CalendarOptions,
      successCallback?: (message: any) => void,
      errorCallback?: (error: any) => void
    ): void;
  
    deleteEvent(
      title: string,
      location: string,
      notes: string,
      startDate: Date,
      endDate: Date,
      successCallback?: (message: any) => void,
      errorCallback?: (error: any) => void
    ): void;
  
    // Add the missing methods:
  
    hasReadWritePermission(
      successCallback: (hasPermission: boolean) => void,
      errorCallback?: (error: any) => void
    ): void;
  
    requestReadWritePermission(
      successCallback: (granted: boolean) => void,
      errorCallback?: (error: any) => void
    ): void;
  
    requestAccessToCalendar(
      successCallback: (granted: boolean) => void,
      errorCallback?: (error: any) => void
    ): void;
  
    // Optionally, you can also add other permission methods:
  
    hasReadPermission(
      successCallback: (hasPermission: boolean) => void,
      errorCallback?: (error: any) => void
    ): void;
  
    hasWritePermission(
      successCallback: (hasPermission: boolean) => void,
      errorCallback?: (error: any) => void
    ): void;
  
    requestReadPermission(
      successCallback: (granted: boolean) => void,
      errorCallback?: (error: any) => void
    ): void;
  
    requestWritePermission(
      successCallback: (granted: boolean) => void,
      errorCallback?: (error: any) => void
    ): void;
  
  }
  
  interface Plugins {
    calendar: CalendarPlugin;
  }
  
  interface Window {
    plugins: Plugins;
  }
  