import { PrinterType } from '../constants/printer-types.enum';

export interface Printer {
  id: number;
  type: PrinterType;
  commissioningDate: Date;
  imageUrl?: string;
}
