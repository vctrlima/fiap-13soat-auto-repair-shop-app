import { GetServiceMetricsById } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetServiceMetricsByIdController implements Controller {
  constructor(private readonly getServiceMetricsById: GetServiceMetricsById) {}

  async handle(params: Request): Promise<Response> {
    try {
      const { id } = params.params;
      const response = await this.getServiceMetricsById.getById({ id });
      return ok(response);
    } catch (error) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetServiceMetricsById.Params>;
type Response = HttpResponse<GetServiceMetricsById.Result>;
