import { makeGetServiceMetricsById } from '@/main/factories/use-cases';
import { GetServiceMetricsByIdController } from '@/presentation/controllers';

export const makeGetServiceMetricsByIdController = (): GetServiceMetricsByIdController =>
  new GetServiceMetricsByIdController(makeGetServiceMetricsById());
