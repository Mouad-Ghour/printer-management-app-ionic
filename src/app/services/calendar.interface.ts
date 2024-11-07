import { MaintenanceEvent } from "../models/maintenance-event.model";

export interface ICalendarService {
    createEvent(event: MaintenanceEvent): Promise<string | null>;
    deleteEvent(event: MaintenanceEvent): Promise<boolean>;
  }
  