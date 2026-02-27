import { CreateWorkOrder } from '@/domain/use-cases';
import { MissingParamError } from '@/presentation/errors';
import { badRequest, created, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class CreateWorkOrderController implements Controller {
  constructor(private readonly createWorkOrder: CreateWorkOrder) {}

  async handle(request: Request): Promise<Response> {
    try {
      const body = request.body;
      if (!body) return badRequest(new MissingParamError('body'));
      const { customerId, vehicleId, serviceIds, partAndSupplyIds, status } = body;
      if (!customerId) return badRequest(new MissingParamError('customerId'));
      if (!vehicleId) return badRequest(new MissingParamError('vehicleId'));
      const workOrder = await this.createWorkOrder.create({
        customerId,
        vehicleId,
        serviceIds,
        partAndSupplyIds,
        status,
      });
      return created(workOrder);
    } catch (error) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest<CreateWorkOrder.Params>;
type Response = HttpResponse<CreateWorkOrder.Result>;
