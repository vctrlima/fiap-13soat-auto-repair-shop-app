import { GetServiceById } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetServiceByIdController implements Controller {
  constructor(private readonly getServiceById: GetServiceById) {}

  async handle(params: Request): Promise<Response> {
    try {
      const { id } = params.params;
      const service = await this.getServiceById.getById({ id });
      return ok(service);
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetServiceById.Params>;
type Response = HttpResponse<GetServiceById.Result>;
