import { Role } from '@/domain/enums';
import { RefreshToken } from '@/domain/use-cases';
import { MissingParamError, UnauthorizedError } from '@/presentation/errors';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { RefreshTokenController } from './refresh-token-controller';

const refreshTokenMock = (): RefreshToken => {
  return { refresh: jest.fn() } as RefreshToken;
};

describe('RefreshTokenController', () => {
  let refreshToken: RefreshToken;
  let refreshTokenController: RefreshTokenController;

  beforeEach(() => {
    refreshToken = refreshTokenMock();
    refreshTokenController = new RefreshTokenController(refreshToken);
  });

  const mockRefreshTokenParams = {
    refreshToken: faker.string.alphanumeric(100),
  };

  const mockRefreshTokenResult = {
    user: {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: Role.Default,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    accessToken: faker.string.alphanumeric(100),
    refreshToken: faker.string.alphanumeric(100),
  };

  it('should return 200 with new tokens on successful refresh', async () => {
    const request: HttpRequest<RefreshToken.Params> = {
      body: mockRefreshTokenParams,
    };
    jest.spyOn(refreshToken, 'refresh').mockResolvedValueOnce(mockRefreshTokenResult);

    const response = await refreshTokenController.handle(request);

    expect(refreshToken.refresh).toHaveBeenCalledWith(mockRefreshTokenParams);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockRefreshTokenResult);
  });

  it('should return 400 when body is missing', async () => {
    const request: HttpRequest<RefreshToken.Params> = {};

    const response = await refreshTokenController.handle(request);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(new MissingParamError('body'));
  });

  it('should return 400 when refreshToken is missing from body', async () => {
    const request: HttpRequest<RefreshToken.Params> = {
      body: {} as RefreshToken.Params,
    };

    const response = await refreshTokenController.handle(request);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(new MissingParamError('refreshToken'));
  });

  it('should return 401 when refresh token is invalid', async () => {
    const request: HttpRequest<RefreshToken.Params> = {
      body: mockRefreshTokenParams,
    };
    jest.spyOn(refreshToken, 'refresh').mockRejectedValueOnce(new UnauthorizedError());

    const response = await refreshTokenController.handle(request);

    expect(refreshToken.refresh).toHaveBeenCalledWith(mockRefreshTokenParams);
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(new UnauthorizedError());
  });

  it('should return 500 when an unexpected error occurs', async () => {
    const request: HttpRequest<RefreshToken.Params> = {
      body: mockRefreshTokenParams,
    };
    const unexpectedError = new Error('Database connection failed');
    jest.spyOn(refreshToken, 'refresh').mockRejectedValueOnce(unexpectedError);

    const response = await refreshTokenController.handle(request);

    expect(refreshToken.refresh).toHaveBeenCalledWith(mockRefreshTokenParams);
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });

  it('should return 400 when refreshToken is empty string', async () => {
    const request: HttpRequest<RefreshToken.Params> = {
      body: { refreshToken: '' },
    };

    const response = await refreshTokenController.handle(request);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(new MissingParamError('refreshToken'));
  });

  it('should call refresh with correct parameters', async () => {
    const customRefreshToken = 'custom-refresh-token-123';
    const request: HttpRequest<RefreshToken.Params> = {
      body: { refreshToken: customRefreshToken },
    };
    jest.spyOn(refreshToken, 'refresh').mockResolvedValueOnce(mockRefreshTokenResult);

    await refreshTokenController.handle(request);

    expect(refreshToken.refresh).toHaveBeenCalledWith({ refreshToken: customRefreshToken });
    expect(refreshToken.refresh).toHaveBeenCalledTimes(1);
  });
});
