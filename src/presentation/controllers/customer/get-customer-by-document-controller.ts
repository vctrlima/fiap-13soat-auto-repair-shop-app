import { GetCustomerByDocument } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetCustomerByDocumentController implements Controller {
  constructor(private readonly getCustomerByDocument: GetCustomerByDocument) {}

  async handle(request: Request): Promise<Response> {
    try {
      const { document } = request.params;
      const customer = await this.getCustomerByDocument.getByDocument({ document });
      return ok(customer);
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetCustomerByDocument.Params>;
type Response = HttpResponse<GetCustomerByDocument.Result>;
