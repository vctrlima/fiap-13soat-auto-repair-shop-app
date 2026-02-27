import { GetAllServiceMetricsRepository } from '@/application/protocols/db';
import { GetAllServiceMetrics } from '@/domain/use-cases';

export class DbGetAllServiceMetrics implements GetAllServiceMetrics {
  constructor(private readonly getAllServiceMetricsRepository: GetAllServiceMetricsRepository) {}

  async getAll(params: GetAllServiceMetrics.Params): Promise<GetAllServiceMetrics.Result> {
    return await this.getAllServiceMetricsRepository.getAll(params);
  }
}
