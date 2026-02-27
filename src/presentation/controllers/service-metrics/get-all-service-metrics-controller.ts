import { GetAllServiceMetrics } from '@/domain/use-cases';
import { ok, serverError } from '@/presentation/helpers';
import { HttpRequest, HttpResponse } from '@/presentation/protocols';
import { Controller } from '@/presentation/protocols/controller';

export class GetAllServiceMetricsController implements Controller {
  constructor(private readonly getAllServiceMetrics: GetAllServiceMetrics) {}

  async handle(params: Request): Promise<Response> {
    try {
      const query = params.query;
      const response = await this.getAllServiceMetrics.getAll(query);
      return ok(response);
    } catch (error) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetAllServiceMetrics.Params>;
type Response = HttpResponse<GetAllServiceMetrics.Result>;
