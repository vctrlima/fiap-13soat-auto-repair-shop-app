import { Role } from '@/domain/enums';
import { UpdateUser } from '@/domain/use-cases';
import { MissingParamError, ServerError } from '@/presentation/errors';
import { badRequest, ok, serverError } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { EmailValidator, PasswordValidator } from '@/validation/validators';
import { faker } from '@faker-js/faker';
import { UpdateUserController } from './update-user-controller';

const updateUserMock = (): UpdateUser => ({
  update: jest.fn(),
});

const emailValidatorMock = (): EmailValidator => ({
  validate: jest.fn(),
});

const passwordValidatorMock = (): PasswordValidator => ({
  capitalLettersRegExp: /(?=.*[A-Z])/.source,
  numbersRegExp: /(?=.*[0-9])/.source,
  symbolsRegExp: /(?=.*[!@#$%^&*])/.source,
  validate: jest.fn(),
});

describe('UpdateUserController', () => {
  let updateUser: UpdateUser;
  let emailValidator: EmailValidator;
  let passwordValidator: PasswordValidator;
  let updateUserController: UpdateUserController;

  beforeEach(() => {
    updateUser = updateUserMock();
    emailValidator = emailValidatorMock();
    passwordValidator = passwordValidatorMock();
    updateUserController = new UpdateUserController(updateUser, emailValidator, passwordValidator);
  });

  it('should update an existing user and return 200 OK', async () => {
    const id = faker.string.uuid();
    const email = faker.internet.email();
    const password = '@Abc1234';
    const name = faker.person.fullName();
    const updateParams: UpdateUser.Params = {
      id,
      name,
      email,
      password,
      role: Role.Default,
    };
    jest.spyOn(emailValidator, 'validate').mockReturnValue(null);
    jest.spyOn(passwordValidator, 'validate').mockReturnValue(null);
    const updatedUser = { ...updateParams, createdAt: new Date(), updatedAt: new Date() } as UpdateUser.Result;
    jest.spyOn(updateUser, 'update').mockResolvedValue(updatedUser);
    const request: HttpRequest<UpdateUser.Params> = { body: updateParams, params: { id: updateParams.id } };

    const response = await updateUserController.handle(request);

    expect(emailValidator.validate).toHaveBeenCalledWith(email);
    expect(passwordValidator.validate).toHaveBeenCalledWith(password);
    expect(updateUser.update).toHaveBeenCalledWith(updateParams);
    expect(response).toEqual(ok(updatedUser));
  });

  it('should throw MissingParamError if id is not provided', async () => {
    const request: HttpRequest<UpdateUser.Params> = {};

    const response = await updateUserController.handle(request);

    expect(response).toEqual(badRequest(new MissingParamError('id')));
  });

  it('should throw MissingParamError if body is not provided', async () => {
    const request: HttpRequest<UpdateUser.Params> = { params: { id: faker.string.uuid() } };

    const response = await updateUserController.handle(request);

    expect(response).toEqual(badRequest(new MissingParamError('body')));
  });

  it('should return 400 if email validation fails', async () => {
    const email = faker.internet.email();
    const updateParams: UpdateUser.Params = {
      id: faker.string.uuid(),
      email: email,
      password: faker.internet.password(),
      name: faker.person.fullName(),
      role: Role.Default,
    };
    jest.spyOn(emailValidator, 'validate').mockReturnValue(new Error('Invalid email'));
    const request: HttpRequest<UpdateUser.Params> = { body: updateParams, params: { id: updateParams.id } };

    const response = await updateUserController.handle(request);

    expect(emailValidator.validate).toHaveBeenCalledWith(email);
    expect(response).toEqual(badRequest(new Error('Invalid email')));
  });

  it('should return 400 if password validation fails', async () => {
    const password = faker.internet.password();
    const updateParams: UpdateUser.Params = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      password: password,
      name: faker.person.fullName(),
      role: Role.Default,
    };
    jest.spyOn(emailValidator, 'validate').mockReturnValue(null);
    jest.spyOn(passwordValidator, 'validate').mockReturnValue(new Error('Weak password'));
    const request: HttpRequest<UpdateUser.Params> = { body: updateParams, params: { id: updateParams.id } };

    const response = await updateUserController.handle(request);

    expect(emailValidator.validate).toHaveBeenCalledWith(updateParams.email);
    expect(passwordValidator.validate).toHaveBeenCalledWith(password);
    expect(response).toEqual(badRequest(new Error('Weak password')));
  });

  it('should return 500 if an error occurs', async () => {
    const updateParams: UpdateUser.Params = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.person.fullName(),
      role: Role.Default,
    };
    jest.spyOn(emailValidator, 'validate').mockReturnValue(null);
    jest.spyOn(passwordValidator, 'validate').mockReturnValue(null);
    jest.spyOn(updateUser, 'update').mockRejectedValue(new Error('error'));
    const request: HttpRequest<UpdateUser.Params> = {
      params: { id: updateParams.id },
      body: updateParams,
    };

    const response = await updateUserController.handle(request);

    expect(emailValidator.validate).toHaveBeenCalledWith(updateParams.email);
    expect(passwordValidator.validate).toHaveBeenCalledWith(updateParams.password);
    expect(updateUser.update).toHaveBeenCalledWith(updateParams);
    expect(response).toEqual(serverError(new ServerError('Internal server error')));
  });
});
