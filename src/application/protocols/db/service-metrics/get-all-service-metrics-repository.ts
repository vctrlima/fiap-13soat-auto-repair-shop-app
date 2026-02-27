import { GetAllServiceMetrics } from '@/domain/use-cases';

export interface GetAllServiceMetricsRepository {
  getAll: (params: GetAllServiceMetricsRepository.Params) => Promise<GetAllServiceMetricsRepository.Result>;
}

export namespace GetAllServiceMetricsRepository {
  export type Params = GetAllServiceMetrics.Params;

  export type Result = GetAllServiceMetrics.Result;
}
