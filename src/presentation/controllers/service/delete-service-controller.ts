import { DeleteService } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { noContent, notFound, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class DeleteServiceController implements Controller {
  constructor(private readonly deleteService: DeleteService) {}

  async handle(params: Request): Promise<Response> {
    try {
      const { id } = params.params;
      await this.deleteService.delete({ id });
      return noContent();
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<DeleteService.Params>;
type Response = HttpResponse<DeleteService.Result>;
