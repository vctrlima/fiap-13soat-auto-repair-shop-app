import { GetUserByToken } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { OptionalAuthMiddleware } from './optional-auth-middleware';

describe('OptionalAuthMiddleware', () => {
  let getUserByTokenStub: jest.Mocked<GetUserByToken>;
  let sut: OptionalAuthMiddleware;

  beforeEach(() => {
    getUserByTokenStub = { getByToken: jest.fn() };
    sut = new OptionalAuthMiddleware(getUserByTokenStub);
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
