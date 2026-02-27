import { RefreshToken } from '@/domain/use-cases';
import { MissingParamError, UnauthorizedError } from '@/presentation/errors';
import { badRequest, ok, serverError, unauthorized } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';

export class RefreshTokenController implements Controller {
  constructor(private readonly refreshToken: RefreshToken) {}

  public async handle(request: Request): Promise<Response> {
    try {
      const { body } = request;
      if (!body) return badRequest(new MissingParamError('body'));
      if (!body.refreshToken) return badRequest(new MissingParamError('refreshToken'));
      const result = await this.refreshToken.refresh(body);
      return ok(result);
    } catch (error) {
      if (error instanceof UnauthorizedError) return unauthorized();
      return serverError(error);
    }
  }
}

type Request = HttpRequest<RefreshToken.Params>;
type Response = HttpResponse<RefreshToken.Result>;
