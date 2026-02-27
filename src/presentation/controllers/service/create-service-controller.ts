import { CreateService } from '@/domain/use-cases';
import { MissingParamError } from '@/presentation/errors';
import { badRequest, created, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class CreateServiceController implements Controller {
  constructor(private readonly createService: CreateService) {}

  async handle(params: Request): Promise<Response> {
    try {
      const body = params.body;
      if (!body) return badRequest(new MissingParamError('body'));
      const service = await this.createService.create(body);
      return created(service);
    } catch (error) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest<CreateService.Params>;
type Response = HttpResponse<CreateService.Result>;
