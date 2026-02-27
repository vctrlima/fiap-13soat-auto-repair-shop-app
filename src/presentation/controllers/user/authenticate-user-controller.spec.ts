import { Role } from '@/domain/enums';
import { AuthenticateUser } from '@/domain/use-cases';
import { MissingParamError, UnauthorizedError } from '@/presentation/errors';
import { InvalidFieldError } from '@/validation/errors';
import { EmailValidator, PasswordValidator } from '@/validation/validators';
import { AuthenticateUserController } from './authenticate-user-controller';

describe('AuthenticateUserController', () => {
  let sut: AuthenticateUserController;
  let authenticateUserStub: jest.Mocked<AuthenticateUser>;
  let emailValidatorStub: jest.Mocked<EmailValidator>;
  let passwordValidatorStub: jest.Mocked<PasswordValidator>;

  const mockAuthResult: AuthenticateUser.Result = {
    user: {
      id: 'any-id',
      name: 'Any Name',
      email: 'any@email.com',
      role: Role.Default,
      createdAt: new Date(),
      updatedAt: null,
    },
    accessToken: 'any-access-token',
    refreshToken: 'any-refresh-token',
  };

  const mockRequest = {
    body: {
      email: 'valid@email.com',
      password: 'ValidPass123!',
    },
  };

  beforeEach(() => {
    authenticateUserStub = {
      authenticate: jest.fn().mockResolvedValue(mockAuthResult),
    } as any;

    emailValidatorStub = {
      validate: jest.fn().mockReturnValue(null),
    } as any;

    passwordValidatorStub = {
      validate: jest.fn().mockReturnValue(null),
    } as any;

    sut = new AuthenticateUserController(authenticateUserStub, emailValidatorStub, passwordValidatorStub);
  });

  describe('handle', () => {
    it('should return 400 if no body is provided', async () => {
      const request = { body: undefined };

      const response = await sut.handle(request);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(new MissingParamError('body'));
    });

    it('should call EmailValidator with correct email', async () => {
      await sut.handle(mockRequest);

      expect(emailValidatorStub.validate).toHaveBeenCalledWith('valid@email.com');
    });

    it('should return 400 if email validation fails', async () => {
      const invalidFieldError = new InvalidFieldError('email');
      emailValidatorStub.validate.mockReturnValueOnce(invalidFieldError);

      const response = await sut.handle(mockRequest);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(invalidFieldError);
    });

    it('should call PasswordValidator with correct password', async () => {
      await sut.handle(mockRequest);

      expect(passwordValidatorStub.validate).toHaveBeenCalledWith('ValidPass123!');
    });

    it('should return 400 if password validation fails', async () => {
      const invalidFieldError = new InvalidFieldError('password');
      passwordValidatorStub.validate.mockReturnValueOnce(invalidFieldError);

      const response = await sut.handle(mockRequest);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(invalidFieldError);
    });

    it('should call AuthenticateUser with correct values', async () => {
      await sut.handle(mockRequest);

      expect(authenticateUserStub.authenticate).toHaveBeenCalledWith({
        email: 'valid@email.com',
        password: 'ValidPass123!',
      });
    });

    it('should return 200 with auth result on success', async () => {
      const response = await sut.handle(mockRequest);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockAuthResult);
    });

    it('should return 401 if AuthenticateUser throws UnauthorizedError', async () => {
      authenticateUserStub.authenticate.mockRejectedValueOnce(new UnauthorizedError());

      const response = await sut.handle(mockRequest);

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual(new UnauthorizedError());
    });

    it('should return 500 if AuthenticateUser throws unexpected error', async () => {
      const error = new Error('Unexpected error');
      authenticateUserStub.authenticate.mockRejectedValueOnce(error);

      const response = await sut.handle(mockRequest);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    it('should not call AuthenticateUser if email validation fails', async () => {
      emailValidatorStub.validate.mockReturnValueOnce(new InvalidFieldError('email'));

      await sut.handle(mockRequest);

      expect(authenticateUserStub.authenticate).not.toHaveBeenCalled();
    });

    it('should not call AuthenticateUser if password validation fails', async () => {
      passwordValidatorStub.validate.mockReturnValueOnce(new InvalidFieldError('password'));

      await sut.handle(mockRequest);

      expect(authenticateUserStub.authenticate).not.toHaveBeenCalled();
    });
  });
});
