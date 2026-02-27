import { CreateUser } from '@/domain/use-cases';
import { MissingParamError } from '@/presentation/errors/missing-param-error';
import { badRequest, created, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';
import { EmailValidator, PasswordValidator } from '@/validation/validators';

export class CreateUserController implements Controller {
  constructor(
    private readonly createUser: CreateUser,
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
      const user = await this.createUser.create(body);
      return created(user);
    } catch (error) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest<CreateUser.Params>;
type Response = HttpResponse<CreateUser.Result>;
