import { makeGetAllServiceMetrics } from '@/main/factories/use-cases';
import { GetAllServiceMetricsController } from '@/presentation/controllers';

export const makeGetAllServiceMetricsController = (): GetAllServiceMetricsController =>
  new GetAllServiceMetricsController(makeGetAllServiceMetrics());
