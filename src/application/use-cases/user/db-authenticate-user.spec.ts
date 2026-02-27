import { Encrypter, HashComparer } from '@/application/protocols/cryptography';
import { AuthenticateUserRepository, CreateRefreshTokenRepository } from '@/application/protocols/db';
import { Role } from '@/domain/enums';
import { AuthenticateUser } from '@/domain/use-cases';
import { UnauthorizedError } from '@/presentation/errors';
import { faker } from '@faker-js/faker';
import { DbAuthenticateUser } from './db-authenticate-user';

const authenticateUserRepositoryMock = (): AuthenticateUserRepository => {
  return { authenticate: jest.fn() } as AuthenticateUserRepository;
};

const hashComparerMock = (): HashComparer => {
  return { compare: jest.fn() } as HashComparer;
};

const encrypterMock = (): Encrypter => {
  return { encrypt: jest.fn() } as Encrypter;
};

const createRefreshTokenRepositoryMock = (): CreateRefreshTokenRepository => {
  return { create: jest.fn() } as CreateRefreshTokenRepository;
};

describe('DbAuthenticateUser', () => {
  let authenticateUserRepository: AuthenticateUserRepository;
  let hashComparer: HashComparer;
  let encrypter: Encrypter;
  let createRefreshTokenRepository: CreateRefreshTokenRepository;
  let dbAuthenticateUser: DbAuthenticateUser;

  beforeEach(() => {
    authenticateUserRepository = authenticateUserRepositoryMock();
    hashComparer = hashComparerMock();
    encrypter = encrypterMock();
    createRefreshTokenRepository = createRefreshTokenRepositoryMock();
    dbAuthenticateUser = new DbAuthenticateUser(
      authenticateUserRepository,
      hashComparer,
      encrypter,
      createRefreshTokenRepository
    );
  });

  const mockUser = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: Role.Default,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthenticateParams: AuthenticateUser.Params = {
    email: mockUser.email,
    password: 'plainPassword',
  };

  it('should authenticate user successfully', async () => {
    jest.spyOn(authenticateUserRepository, 'authenticate').mockResolvedValueOnce(mockUser);
    jest.spyOn(hashComparer, 'compare').mockResolvedValueOnce(true);
    jest
      .spyOn(encrypter, 'encrypt')
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    jest.spyOn(createRefreshTokenRepository, 'create').mockResolvedValueOnce();

    const result = await dbAuthenticateUser.authenticate(mockAuthenticateParams);

    expect(authenticateUserRepository.authenticate).toHaveBeenCalledWith({ email: mockUser.email });
    expect(hashComparer.compare).toHaveBeenCalledWith('plainPassword', mockUser.password);
    expect(encrypter.encrypt).toHaveBeenCalledTimes(2);
    expect(createRefreshTokenRepository.create).toHaveBeenCalled();
    expect(result).toEqual({
      user: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('should throw UnauthorizedError when user is not found', async () => {
    jest.spyOn(authenticateUserRepository, 'authenticate').mockResolvedValueOnce(null);

    await expect(dbAuthenticateUser.authenticate(mockAuthenticateParams)).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError when password does not match', async () => {
    jest.spyOn(authenticateUserRepository, 'authenticate').mockResolvedValueOnce(mockUser);
    jest.spyOn(hashComparer, 'compare').mockResolvedValueOnce(false);

    await expect(dbAuthenticateUser.authenticate(mockAuthenticateParams)).rejects.toThrow(UnauthorizedError);
  });
});
