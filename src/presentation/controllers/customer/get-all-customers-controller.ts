import { GetAllCustomers } from '@/domain/use-cases';
import { ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetAllCustomersController implements Controller {
  constructor(private readonly getAllCustomers: GetAllCustomers) {}

  async handle(params: Request): Promise<Response> {
    try {
      const query = params.query;
      const customers = await this.getAllCustomers.getAll(query);
      return ok(customers);
    } catch (error) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetAllCustomers.Params>;
type Response = HttpResponse<GetAllCustomers.Result>;
