import { GetPartOrSupplyById } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetPartOrSupplyByIdController implements Controller {
  constructor(private readonly getPartOrSupplyById: GetPartOrSupplyById) {}

  async handle(params: Request): Promise<Response> {
    try {
      const { id } = params.params;
      const partOrSupply = await this.getPartOrSupplyById.getById({ id });
      return ok(partOrSupply);
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetPartOrSupplyById.Params>;
type Response = HttpResponse<GetPartOrSupplyById.Result>;
