import { UpdateService } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class UpdateServiceController implements Controller {
  constructor(private readonly updateService: UpdateService) {}

  async handle(params: Request): Promise<Response> {
    try {
      const { id } = params.params;
      const data = params.body;
      const service = await this.updateService.update({ id, ...data });
      return ok(service);
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<Omit<UpdateService.Params, 'id'>>;
type Response = HttpResponse<UpdateService.Result>;
