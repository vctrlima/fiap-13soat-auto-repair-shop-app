import { DeleteUser } from '@/domain/use-cases';
import { MissingParamError, NotFoundError, ServerError } from '@/presentation/errors';
import { badRequest, noContent, notFound, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class DeleteUserController implements Controller {
  constructor(private readonly deleteUser: DeleteUser) {}

  async handle(request: Request): Promise<Response> {
    try {
      const { id } = request.params || {};
      if (!id) return badRequest(new MissingParamError('id'));
      await this.deleteUser.delete({ id });
      return noContent();
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(new ServerError('Internal server error'));
    }
  }
}

type Request = HttpRequest<DeleteUser.Params>;
type Response = HttpResponse<DeleteUser.Result>;
