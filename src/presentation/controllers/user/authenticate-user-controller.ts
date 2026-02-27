import { AuthenticateUser } from '@/domain/use-cases';
import { MissingParamError, UnauthorizedError } from '@/presentation/errors';
import { badRequest, ok, serverError, unauthorized } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';
import { EmailValidator, PasswordValidator } from '@/validation/validators';

export class AuthenticateUserController implements Controller {
  constructor(
    private readonly authenticateUser: AuthenticateUser,
    private readonly emailValidator: EmailValidator,
    private readonly passwordValidator: PasswordValidator
  ) {}

  public async handle(request: Request): Promise<Response> {
    try {
      const { body } = request;
      if (!body) return badRequest(new MissingParamError('body'));

      const invalidEmail = this.emailValidator.validate(body.email);
      if (invalidEmail) return badRequest(invalidEmail);

      const invalidPassword = this.passwordValidator.validate(body.password);
      if (invalidPassword) return badRequest(invalidPassword);

      const authResult = await this.authenticateUser.authenticate(body);
      return ok(authResult);
    } catch (error) {
      if (error instanceof UnauthorizedError) return unauthorized();
      return serverError(error);
    }
  }
}

type Request = HttpRequest<AuthenticateUser.Params>;
type Response = HttpResponse<AuthenticateUser.Result>;
