import { ServiceMetrics } from '@/domain/entities';

export interface GetServiceMetricsById {
  getById(params: GetServiceMetricsById.Params): Promise<GetServiceMetricsById.Result>;
}

export namespace GetServiceMetricsById {
  export type Params = { id: string };

  export type Result = ServiceMetrics;
}
