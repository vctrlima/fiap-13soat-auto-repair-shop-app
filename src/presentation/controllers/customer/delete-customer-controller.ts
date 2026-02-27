import { DeleteCustomer } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { noContent, notFound, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class DeleteCustomerController implements Controller {
  constructor(private readonly deleteCustomer: DeleteCustomer) {}

  async handle(params: Request): Promise<Response> {
    try {
      const { document } = params.params;
      await this.deleteCustomer.delete({ document });
      return noContent();
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<DeleteCustomer.Params>;
type Response = HttpResponse<DeleteCustomer.Result>;
