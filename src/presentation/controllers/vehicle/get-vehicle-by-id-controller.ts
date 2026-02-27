import { GetVehicleById } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetVehicleByIdController implements Controller {
  constructor(private readonly getVehicleById: GetVehicleById) {}

  async handle(params: Request): Promise<Response> {
    try {
      const { id } = params.params;
      const vehicle = await this.getVehicleById.getById({ id });
      return ok(vehicle);
    } catch (error) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetVehicleById.Params>;
type Response = HttpResponse<GetVehicleById.Result>;
