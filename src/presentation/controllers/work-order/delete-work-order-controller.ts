import { DeleteWorkOrder } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { noContent, notFound, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class DeleteWorkOrderController implements Controller {
  constructor(private readonly deleteWorkOrder: DeleteWorkOrder) {}

  async handle(request: Request): Promise<Response> {
    try {
      const id = request.params?.id;
      await this.deleteWorkOrder.delete({ id });
      return noContent();
    } catch (error) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<DeleteWorkOrder.Params>;
type Response = HttpResponse<DeleteWorkOrder.Result>;
