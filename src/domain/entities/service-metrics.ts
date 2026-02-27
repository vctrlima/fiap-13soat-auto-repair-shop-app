import { Service } from './service';

export interface ServiceMetrics {
  averageExecutionTimeInMinutes: number;
  service: Service;
}
