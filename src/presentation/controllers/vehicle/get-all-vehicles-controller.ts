import { GetAllVehicles } from '@/domain/use-cases';
import { ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetAllVehiclesController implements Controller {
  constructor(private readonly getAllVehicles: GetAllVehicles) {}

  async handle(params: Request): Promise<Response> {
    try {
      const query = params.query;
      const vehicles = await this.getAllVehicles.getAll(query);
      return ok(vehicles);
    } catch (error) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetAllVehicles.Params>;
type Response = HttpResponse<GetAllVehicles.Result>;
