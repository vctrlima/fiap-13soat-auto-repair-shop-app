import { GetUserByToken } from '@/domain/use-cases';
import { AccessDeniedError } from '@/presentation/errors';
import { faker } from '@faker-js/faker';
import { AuthMiddleware } from './auth-middleware';

describe('AuthMiddleware', () => {
  let getUserByTokenStub: jest.Mocked<GetUserByToken>;
  let sut: AuthMiddleware;

  beforeEach(() => {
    getUserByTokenStub = { getByToken: jest.fn() };
    sut = new AuthMiddleware(getUserByTokenStub);
  });

  it('should throw AccessDeniedError if no authorization header is provided', async () => {
    const request = {};

    await expect(sut.handle(request as AuthMiddleware.Request)).rejects.toThrow(AccessDeniedError);
  });

  it('should throw AccessDeniedError if token is invalid', async () => {
    getUserByTokenStub.getByToken.mockResolvedValue(null as any);

    const request = { authorization: `Bearer ${faker.internet.jwt()}` };

    await expect(sut.handle(request)).rejects.toThrow(AccessDeniedError);
  });

  it('should call GetUserByToken with correct token', async () => {
    const token = faker.internet.jwt();
    getUserByTokenStub.getByToken.mockResolvedValue({
      id: faker.string.uuid(),
    } as any);

    const request = { authorization: `Bearer ${token}` };

    await sut.handle(request);
    expect(getUserByTokenStub.getByToken).toHaveBeenCalledWith({ token });
  });

  it('should not throw if a valid token is provided', async () => {
    getUserByTokenStub.getByToken.mockResolvedValue({
      id: faker.string.uuid(),
    } as any);

    const request = { authorization: `Bearer ${faker.internet.jwt()}` };

    await expect(sut.handle(request)).resolves.not.toThrow();
  });
});
