import { Decrypter, Encrypter } from '@/application/protocols/cryptography';
import {
  CreateRefreshTokenRepository,
  DeleteRefreshTokenRepository,
  GetUserByIdRepository,
  ValidateRefreshTokenRepository,
} from '@/application/protocols/db';
import { Role } from '@/domain/enums';
import { RefreshToken } from '@/domain/use-cases';
import { UnauthorizedError } from '@/presentation/errors';
import { faker } from '@faker-js/faker';
import { DbRefreshToken } from './db-refresh-token';

const validateRefreshTokenRepositoryMock = (): ValidateRefreshTokenRepository => {
  return { validate: jest.fn() } as ValidateRefreshTokenRepository;
};

const deleteRefreshTokenRepositoryMock = (): DeleteRefreshTokenRepository => {
  return { delete: jest.fn() } as DeleteRefreshTokenRepository;
};

const createRefreshTokenRepositoryMock = (): CreateRefreshTokenRepository => {
  return { create: jest.fn() } as CreateRefreshTokenRepository;
};

const getUserByIdRepositoryMock = (): GetUserByIdRepository => {
  return { getById: jest.fn() } as GetUserByIdRepository;
};

const decrypterMock = (): Decrypter => {
  return { decrypt: jest.fn() } as Decrypter;
};

const encrypterMock = (): Encrypter => {
  return { encrypt: jest.fn() } as Encrypter;
};

describe('DbRefreshToken', () => {
  let validateRefreshTokenRepository: ValidateRefreshTokenRepository;
  let deleteRefreshTokenRepository: DeleteRefreshTokenRepository;
  let createRefreshTokenRepository: CreateRefreshTokenRepository;
  let getUserByIdRepository: GetUserByIdRepository;
  let decrypter: Decrypter;
  let encrypter: Encrypter;
  let dbRefreshToken: DbRefreshToken;

  beforeEach(() => {
    validateRefreshTokenRepository = validateRefreshTokenRepositoryMock();
    deleteRefreshTokenRepository = deleteRefreshTokenRepositoryMock();
    createRefreshTokenRepository = createRefreshTokenRepositoryMock();
    getUserByIdRepository = getUserByIdRepositoryMock();
    decrypter = decrypterMock();
    encrypter = encrypterMock();
    dbRefreshToken = new DbRefreshToken(
      validateRefreshTokenRepository,
      deleteRefreshTokenRepository,
      createRefreshTokenRepository,
      getUserByIdRepository,
      decrypter,
      encrypter
    );
  });

  const mockUser = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: Role.Default,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokenData = {
    id: faker.string.uuid(),
    userId: mockUser.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  const mockRefreshParams: RefreshToken.Params = {
    refreshToken: 'valid-refresh-token',
  };

  it('should refresh tokens successfully', async () => {
    const tokenPayload = { id: mockUser.id, jti: 'some-jti' };
    jest.spyOn(validateRefreshTokenRepository, 'validate').mockResolvedValueOnce(mockTokenData);
    jest.spyOn(decrypter, 'decrypt').mockResolvedValueOnce(tokenPayload as any);
    jest.spyOn(getUserByIdRepository, 'getById').mockResolvedValueOnce(mockUser);
    jest
      .spyOn(encrypter, 'encrypt')
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');
    jest.spyOn(deleteRefreshTokenRepository, 'delete').mockResolvedValueOnce();
    jest.spyOn(createRefreshTokenRepository, 'create').mockResolvedValueOnce();

    const result = await dbRefreshToken.refresh(mockRefreshParams);

    expect(validateRefreshTokenRepository.validate).toHaveBeenCalledWith({ token: 'valid-refresh-token' });
    expect(decrypter.decrypt).toHaveBeenCalled();
    expect(getUserByIdRepository.getById).toHaveBeenCalledWith({ id: mockUser.id });
    expect(encrypter.encrypt).toHaveBeenCalledTimes(2);
    expect(deleteRefreshTokenRepository.delete).toHaveBeenCalledWith({ token: 'valid-refresh-token' });
    expect(createRefreshTokenRepository.create).toHaveBeenCalled();
    expect(result).toEqual({
      user: mockUser,
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });

  it('should throw UnauthorizedError when refresh token is invalid in database', async () => {
    jest.spyOn(validateRefreshTokenRepository, 'validate').mockResolvedValueOnce(null);

    await expect(dbRefreshToken.refresh(mockRefreshParams)).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError when JWT token is invalid', async () => {
    jest.spyOn(validateRefreshTokenRepository, 'validate').mockResolvedValueOnce(mockTokenData);
    jest.spyOn(decrypter, 'decrypt').mockRejectedValueOnce(new Error('Invalid token'));
    jest.spyOn(deleteRefreshTokenRepository, 'delete').mockResolvedValueOnce();

    await expect(dbRefreshToken.refresh(mockRefreshParams)).rejects.toThrow(UnauthorizedError);
    expect(deleteRefreshTokenRepository.delete).toHaveBeenCalledWith({ token: 'valid-refresh-token' });
  });

  it('should throw UnauthorizedError when user ID mismatch', async () => {
    const invalidTokenPayload = { id: 'different-user-id', jti: 'some-jti' };
    jest.spyOn(validateRefreshTokenRepository, 'validate').mockResolvedValueOnce(mockTokenData);
    jest.spyOn(decrypter, 'decrypt').mockResolvedValueOnce(invalidTokenPayload as any);
    jest.spyOn(deleteRefreshTokenRepository, 'delete').mockResolvedValueOnce();

    await expect(dbRefreshToken.refresh(mockRefreshParams)).rejects.toThrow(UnauthorizedError);
    expect(deleteRefreshTokenRepository.delete).toHaveBeenCalledWith({ token: 'valid-refresh-token' });
  });

  it('should throw UnauthorizedError when user is not found', async () => {
    const tokenPayload = { id: mockUser.id, jti: 'some-jti' };
    jest.spyOn(validateRefreshTokenRepository, 'validate').mockResolvedValueOnce(mockTokenData);
    jest.spyOn(decrypter, 'decrypt').mockResolvedValueOnce(tokenPayload as any);
    jest.spyOn(getUserByIdRepository, 'getById').mockRejectedValueOnce(new Error('User not found'));
    jest.spyOn(deleteRefreshTokenRepository, 'delete').mockResolvedValueOnce();

    await expect(dbRefreshToken.refresh(mockRefreshParams)).rejects.toThrow(UnauthorizedError);
    expect(deleteRefreshTokenRepository.delete).toHaveBeenCalledWith({ token: 'valid-refresh-token' });
  });
});
