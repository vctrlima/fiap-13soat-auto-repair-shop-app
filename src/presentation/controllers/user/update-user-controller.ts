import { UpdateUser } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { MissingParamError } from '@/presentation/errors/missing-param-error';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';
import { EmailValidator, PasswordValidator } from '@/validation/validators';

export class UpdateUserController implements Controller {
  constructor(
    private readonly updateUser: UpdateUser,
    private readonly emailValidator: EmailValidator,
    private readonly passwordValidator: PasswordValidator
  ) {}

  async handle(request: Request): Promise<Response> {
    try {
      const { params, body } = request;
      if (!params || !params.id) return badRequest(new MissingParamError('id'));
      if (!body) return badRequest(new MissingParamError('body'));
      if (body.email && body.email != null) {
        const invalidEmail = this.emailValidator.validate(body.email);
        if (invalidEmail) return badRequest(invalidEmail);
      }
      if (body.password && body.password != null) {
        const invalidPassword = this.passwordValidator.validate(body.password);
        if (invalidPassword) return badRequest(invalidPassword);
      }
      const user = await this.updateUser.update({ ...body, id: params.id });
      return ok(user);
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<UpdateUser.Params>;
type Response = HttpResponse<UpdateUser.Result>;
