import { GetAllServices } from '@/domain/use-cases';
import { ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetAllServicesController implements Controller {
  constructor(private readonly getAllServices: GetAllServices) {}

  async handle(params: Request): Promise<Response> {
    try {
      const query = params.query;
      const services = await this.getAllServices.getAll(query);
      return ok(services);
    } catch (error) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetAllServices.Params>;
type Response = HttpResponse<GetAllServices.Result>;
