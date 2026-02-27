import { UpdatePartOrSupply } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class UpdatePartOrSupplyController implements Controller {
  constructor(private readonly updatePartOrSupply: UpdatePartOrSupply) {}

  async handle(params: Request): Promise<Response> {
    try {
      const { id } = params.params;
      const data = params.body;
      const partOrSupply = await this.updatePartOrSupply.update({ id, ...data });
      return ok(partOrSupply);
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<Omit<UpdatePartOrSupply.Params, 'id'>>;
type Response = HttpResponse<UpdatePartOrSupply.Result>;
