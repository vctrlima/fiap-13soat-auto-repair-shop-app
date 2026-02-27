import { Role } from '@/domain/enums';
import { CreateUser } from '@/domain/use-cases';
import { badRequest, created, serverError } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { EmailValidator, PasswordValidator } from '@/validation/validators';
import { faker } from '@faker-js/faker';
import { CreateUserController } from './create-user-controller';

const createUserMock = (): CreateUser => ({
  create: jest.fn(),
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

describe('CreateUserController', () => {
  let createUser: CreateUser;
  let emailValidator: EmailValidator;
  let passwordValidator: PasswordValidator;
  let createUserController: CreateUserController;

  beforeEach(() => {
    createUser = createUserMock();
    emailValidator = emailValidatorMock();
    passwordValidator = passwordValidatorMock();
    createUserController = new CreateUserController(createUser, emailValidator, passwordValidator);
  });

  it('should create a new user and return 201 Created', async () => {
    const id = faker.string.uuid();
    const email = faker.internet.email();
    const password = '@Abc1234';
    const name = faker.person.fullName();
    const createParams: CreateUser.Params = {
      name,
      email,
      password,
      role: Role.Admin,
    };
    jest.spyOn(emailValidator, 'validate').mockReturnValue(null);
    jest.spyOn(passwordValidator, 'validate').mockReturnValue(null);
    const createdUser: CreateUser.Result = {
      ...createParams,
      id,
      createdAt: new Date(),
    };
    jest.spyOn(createUser, 'create').mockResolvedValue(createdUser);
    const request: HttpRequest<CreateUser.Params> = { body: createParams };

    const response = await createUserController.handle(request);

    expect(emailValidator.validate).toHaveBeenCalledWith(email);
    expect(passwordValidator.validate).toHaveBeenCalledWith(password);
    expect(createUser.create).toHaveBeenCalledWith(createParams);
    expect(response).toEqual(created(createdUser));
  });

  it('should throw MissingParamError if body is not provided', async () => {
    const request: HttpRequest<CreateUser.Params> = {};

    const response = await createUserController.handle(request);

    expect(response).toEqual(badRequest(new Error('Missing param: body')));
  });

  it('should return 400 if email validation fails', async () => {
    const email = faker.internet.email();
    const createParams: CreateUser.Params = {
      email: email,
      password: faker.internet.password(),
      name: faker.person.fullName(),
      role: Role.Admin,
    };
    const emailValidatorError = new Error('Invalid email');
    jest.spyOn(emailValidator, 'validate').mockReturnValue(emailValidatorError);
    const request: HttpRequest<CreateUser.Params> = {
      body: createParams,
    };

    const response = await createUserController.handle(request);

    expect(emailValidator.validate).toHaveBeenCalledWith(email);
    expect(response).toEqual(badRequest(emailValidatorError));
  });

  it('should return 400 if password validation fails', async () => {
    const email = faker.internet.email();
    const password = 'password';
    const createParams: CreateUser.Params = {
      email,
      password,
      name: faker.person.fullName(),
      role: Role.Admin,
    };
    jest.spyOn(emailValidator, 'validate').mockReturnValue(null);
    const passwordValidatorError = new Error('Invalid password');
    jest.spyOn(passwordValidator, 'validate').mockReturnValue(passwordValidatorError);
    const request: HttpRequest<CreateUser.Params> = { body: createParams };

    const response = await createUserController.handle(request);

    expect(emailValidator.validate).toHaveBeenCalledWith(email);
    expect(passwordValidator.validate).toHaveBeenCalledWith(password);
    expect(response).toEqual(badRequest(passwordValidatorError));
  });

  it('should return 500 if an error occurs', async () => {
    const email = faker.internet.email();
    const password = '@Abc1234';
    const createParams: CreateUser.Params = {
      email,
      password: password,
      name: faker.person.fullName(),
      role: Role.Admin,
    };
    jest.spyOn(emailValidator, 'validate').mockReturnValue(null);
    jest.spyOn(passwordValidator, 'validate').mockReturnValue(null);
    jest.spyOn(createUser, 'create').mockRejectedValue(new Error('Error creating user'));
    const request: HttpRequest<CreateUser.Params> = {
      body: createParams,
    };

    const response = await createUserController.handle(request);

    expect(emailValidator.validate).toHaveBeenCalledWith(email);
    expect(passwordValidator.validate).toHaveBeenCalledWith(password);
    expect(response).toEqual(serverError(new Error('Error creating user')));
  });
});
