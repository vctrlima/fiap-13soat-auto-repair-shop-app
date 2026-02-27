import { GetAllWorkOrders } from '@/domain/use-cases';
import { ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetAllWorkOrdersController implements Controller {
  constructor(private readonly getAllWorkOrders: GetAllWorkOrders) {}

  async handle(request: Request): Promise<Response> {
    try {
      const query = request.query;
      const workOrders = await this.getAllWorkOrders.getAll(query);
      return ok(workOrders);
    } catch (error) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetAllWorkOrders.Params>;
type Response = HttpResponse<GetAllWorkOrders.Result>;
