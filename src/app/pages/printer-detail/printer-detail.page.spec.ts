import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrinterDetailPage } from './printer-detail.page';

describe('PrinterDetailPage', () => {
  let component: PrinterDetailPage;
  let fixture: ComponentFixture<PrinterDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrinterDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
