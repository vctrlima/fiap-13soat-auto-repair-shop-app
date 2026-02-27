import { GetWorkOrderById } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetWorkOrderByIdController implements Controller {
  constructor(private readonly getWorkOrderById: GetWorkOrderById) {}

  async handle(request: Request): Promise<Response> {
    try {
      const { id } = request.params;
      const workOrder = await this.getWorkOrderById.getById({ id });
      return ok(workOrder);
    } catch (error) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetWorkOrderById.Params>;
type Response = HttpResponse<GetWorkOrderById.Result>;
