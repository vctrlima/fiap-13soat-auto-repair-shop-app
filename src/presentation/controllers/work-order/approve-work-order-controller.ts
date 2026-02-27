import { ApproveWorkOrder } from '@/domain/use-cases';
import { MissingParamError, NotFoundError } from '@/presentation/errors';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class ApproveWorkOrderController implements Controller {
  constructor(private readonly approveWorkOrder: ApproveWorkOrder) {}

  async handle(request: Request): Promise<Response> {
    try {
      const id = request.params?.id;
      if (!id) return badRequest(new MissingParamError('id'));
      const workOrder = await this.approveWorkOrder.approve({ id });
      return ok(workOrder);
    } catch (error) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<ApproveWorkOrder.Params>;
type Response = HttpResponse<ApproveWorkOrder.Result>;
