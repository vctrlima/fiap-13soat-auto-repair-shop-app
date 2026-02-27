import { DeletePartOrSupply } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { noContent, notFound, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class DeletePartOrSupplyController implements Controller {
  constructor(private readonly deletePartOrSupply: DeletePartOrSupply) {}

  async handle(params: Request): Promise<Response> {
    try {
      const { id } = params.params;
      await this.deletePartOrSupply.delete({ id });
      return noContent();
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<DeletePartOrSupply.Params>;
type Response = HttpResponse<DeletePartOrSupply.Result>;
