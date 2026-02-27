import { UpdateCustomer } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';
import { InvalidFieldError } from '@/validation/errors';
import { CustomerDocumentValidator } from '@/validation/validators';

export class UpdateCustomerController implements Controller {
  constructor(
    private readonly updateCustomer: UpdateCustomer,
    private readonly customerDocumentValidator: CustomerDocumentValidator
  ) {}

  async handle(params: Request): Promise<Response> {
    try {
      const { document } = params.params;
      const data = params.body;
      const invalidParamsDocument = this.customerDocumentValidator.validate(document);
      if (invalidParamsDocument) return badRequest(invalidParamsDocument);
      if (data?.document) {
        const invalidBodyDocument = this.customerDocumentValidator.validate(data.document);
        if (invalidBodyDocument) return badRequest(invalidBodyDocument);
      }
      const customer = await this.updateCustomer.update({ ...data, document });
      return ok(customer);
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      if (error instanceof InvalidFieldError) return badRequest(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<UpdateCustomer.Params>;
type Response = HttpResponse<UpdateCustomer.Result>;
