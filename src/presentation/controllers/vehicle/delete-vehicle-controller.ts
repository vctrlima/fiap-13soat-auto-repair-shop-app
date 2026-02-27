import { DeleteVehicle } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { noContent, notFound, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class DeleteVehicleController implements Controller {
  constructor(private readonly deleteVehicle: DeleteVehicle) {}

  async handle(request: Request): Promise<Response> {
    try {
      const id = request.params?.id;
      await this.deleteVehicle.delete({ id });
      return noContent();
    } catch (error) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<DeleteVehicle.Params>;
type Response = HttpResponse<DeleteVehicle.Result>;
