import { GetAllPartsOrSupplies } from '@/domain/use-cases';
import { ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetAllPartsOrSuppliesController implements Controller {
  constructor(private readonly getAllPartsOrSupplies: GetAllPartsOrSupplies) {}

  async handle(params: Request): Promise<Response> {
    try {
      const query = params.query;
      const partsOrSupplies = await this.getAllPartsOrSupplies.getAll(query);
      return ok(partsOrSupplies);
    } catch (error) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetAllPartsOrSupplies.Params>;
type Response = HttpResponse<GetAllPartsOrSupplies.Result>;
