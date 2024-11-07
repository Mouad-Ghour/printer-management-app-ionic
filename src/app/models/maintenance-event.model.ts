export interface MaintenanceEvent {
    id: number;
    printerId: number;
    title: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    calendarEventId?: string | null;
    location?: string;
  }