import { GetServiceMetricsByIdRepository } from '@/application/protocols/db';
import { GetServiceMetricsById } from '@/domain/use-cases';

export class DbGetServiceMetricsById implements GetServiceMetricsById {
  constructor(private readonly getServiceMetricsByIdRepository: GetServiceMetricsByIdRepository) {}

  async getById(params: GetServiceMetricsById.Params): Promise<GetServiceMetricsById.Result> {
    return await this.getServiceMetricsByIdRepository.getById(params);
  }
}
