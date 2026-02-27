import { GetAllUsers } from '@/domain/use-cases';
import { ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class GetAllUsersController implements Controller {
  constructor(private readonly getAllUsers: GetAllUsers) {}

  async handle(params: Request): Promise<Response> {
    try {
      const query = params.query;
      const users = await this.getAllUsers.getAll(query);
      return ok(users);
    } catch (error) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest<GetAllUsers.Params>;
type Response = HttpResponse<GetAllUsers.Result>;
