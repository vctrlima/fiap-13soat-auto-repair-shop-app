import { CreateCustomer } from '@/domain/use-cases';
import { MissingParamError } from '@/presentation/errors';
import { badRequest, created, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';
import { InvalidFieldError } from '@/validation/errors';
import { CustomerDocumentValidator } from '@/validation/validators';

export class CreateCustomerController implements Controller {
  constructor(
    private readonly createCustomer: CreateCustomer,
    private readonly customerDocumentValidator: CustomerDocumentValidator
  ) {}

  async handle(params: Request): Promise<Response> {
    try {
      const body = params.body;
      if (!body) return badRequest(new MissingParamError('body'));
      const invalidDocument = this.customerDocumentValidator.validate(body.document);
      if (invalidDocument) return badRequest(invalidDocument);
      const customer = await this.createCustomer.create(body);
      return created(customer);
    } catch (error: any) {
      if (error instanceof InvalidFieldError) return badRequest(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<CreateCustomer.Params>;
type Response = HttpResponse<CreateCustomer.Result>;
