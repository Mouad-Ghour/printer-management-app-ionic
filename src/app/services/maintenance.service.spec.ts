import { TestBed } from '@angular/core/testing';
import { MaintenanceService } from './maintenance.service';
import { Printer } from '../models/printer.model';
import { MaintenanceEvent } from '../models/maintenance-event.model';
import { PRINTER_TYPES } from '../constants/printer-types.constant';

describe('MaintenanceService', () => {
  let service: MaintenanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaintenanceService);
    // Clear local storage before each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should schedule a maintenance event', () => {
    const printer: Printer = {
      id: 1,
      type: PRINTER_TYPES[0],
      commissioningDate: new Date('2021-01-01'),
      imageUrl: 'assets/images/powder-printer.png',
    };

    service.scheduleMaintenance(printer);
    service.getMaintenanceEventsForPrinter(printer.id).subscribe(events => {
      expect(events.length).toBe(1);
      expect(events[0].printerId).toBe(printer.id);
      expect(events[0].title).toBe(`${printer.type} #${printer.id} maintenance.`);
    });
  });

  it('should delete a maintenance event', () => {
    const printer: Printer = {
      id: 2,
      type: PRINTER_TYPES[1],
      commissioningDate: new Date('2022-02-02'),
      imageUrl: 'assets/images/wire-printer.png',
    };

    service.scheduleMaintenance(printer);
    service.getMaintenanceEventsForPrinter(printer.id).subscribe(events => {
      expect(events.length).toBe(1);

      service.deleteMaintenanceEvent(events[0].id);
      service.getMaintenanceEventsForPrinter(printer.id).subscribe(updatedEvents => {
        expect(updatedEvents.length).toBe(0);
      });
    });
  });

  it('should persist maintenance events in local storage', () => {
    const printer: Printer = {
      id: 3,
      type: PRINTER_TYPES[2],
      commissioningDate: new Date('2023-03-03'),
      imageUrl: 'assets/images/resin-printer.png',
    };

    service.scheduleMaintenance(printer);

    // Reload the service to simulate app restart
    const newServiceInstance = TestBed.inject(MaintenanceService);
    newServiceInstance.getMaintenanceEventsForPrinter(printer.id).subscribe(events => {
      expect(events.length).toBe(1);
      expect(events[0].printerId).toBe(printer.id);
    });
  });
});
