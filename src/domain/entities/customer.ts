import { Vehicle } from './vehicle';

export interface Customer {
  id: string;
  document: string;
  name: string;
  email: string;
  phone?: string;
  vehicles?: Vehicle[];
  createdAt: Date;
  updatedAt?: Date | null;
}
