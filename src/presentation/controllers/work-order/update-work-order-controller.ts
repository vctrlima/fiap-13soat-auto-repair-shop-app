import { UpdateWorkOrder } from '@/domain/use-cases';
import { MissingParamError, NotFoundError } from '@/presentation/errors';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class UpdateWorkOrderController implements Controller {
  constructor(private readonly updateWorkOrder: UpdateWorkOrder) {}

  async handle(request: Request): Promise<Response> {
    try {
      const id = request.params?.id;
      if (!id) return badRequest(new MissingParamError('id'));
      if (!request.body) return badRequest(new MissingParamError('body'));

      const { serviceIds, partAndSupplyIds, status } = request.body;
      const workOrder = await this.updateWorkOrder.update({
        id,
        serviceIds,
        partAndSupplyIds,
        status,
      });

      return ok(workOrder);
    } catch (error) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<UpdateWorkOrder.Params>;
type Response = HttpResponse<UpdateWorkOrder.Result>;
