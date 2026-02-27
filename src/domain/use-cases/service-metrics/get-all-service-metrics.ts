import { ServiceMetrics } from '@/domain/entities';
import { DefaultPageParams, Page } from '@/domain/types';

export interface GetAllServiceMetrics {
  getAll(params: GetAllServiceMetrics.Params): Promise<GetAllServiceMetrics.Result>;
}

export namespace GetAllServiceMetrics {
  export type Params = DefaultPageParams & { serviceId?: string };

  export type Result = Page<ServiceMetrics>;
}
