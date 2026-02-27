import { GetServiceMetricsById } from '@/domain/use-cases';

export interface GetServiceMetricsByIdRepository {
  getById: (params: GetServiceMetricsByIdRepository.Params) => Promise<GetServiceMetricsByIdRepository.Result>;
}

export namespace GetServiceMetricsByIdRepository {
  export type Params = GetServiceMetricsById.Params;

  export type Result = GetServiceMetricsById.Result;
}
