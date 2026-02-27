import { GetUserById } from '@/domain/use-cases';
import { MissingParamError, NotFoundError } from '@/presentation/errors';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetUserByIdController implements Controller {
  constructor(private readonly getUserById: GetUserById) {}

  public async handle(request: Request): Promise<Response> {
    try {
      const { params } = request;
      if (!params || !params.id) return badRequest(new MissingParamError('id'));
      return ok(await this.getUserById.getById({ id: params.id }));
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetUserById.Params>;
type Response = HttpResponse<GetUserById.Result>;
