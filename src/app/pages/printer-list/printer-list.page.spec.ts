import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrinterListPage } from './printer-list.page';

describe('PrinterListPage', () => {
  let component: PrinterListPage;
  let fixture: ComponentFixture<PrinterListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrinterListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
