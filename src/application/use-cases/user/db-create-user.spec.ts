import { CreateUserRepository } from '@/application/protocols/db';
import { Role } from '@/domain/enums';
import { CreateUser } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbCreateUser } from './db-create-user';
import { Hasher } from '@/application/protocols/cryptography';

const createUserRepositoryMock = (): CreateUserRepository => {
  return { create: jest.fn() } as CreateUserRepository;
};

const hasherMock = (): Hasher => {
  return { hash: jest.fn() } as Hasher;
};

describe('DbCreateUser', () => {
  let createUserRepository: CreateUserRepository;
  let dbCreateUser: DbCreateUser;
  let hasher: Hasher;

  beforeEach(() => {
    createUserRepository = createUserRepositoryMock();
    hasher = hasherMock();
    dbCreateUser = new DbCreateUser(createUserRepository, hasher);
  });

  it('should create a new user', async () => {
    const params: CreateUser.Params = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: Role.Admin,
    };
    const createdUser: CreateUser.Result = {
      id: faker.string.uuid(),
      name: params.name,
      email: params.email,
      role: params.role,
      createdAt: new Date(),
      updatedAt: undefined,
    };
    jest.spyOn(createUserRepository, 'create').mockResolvedValueOnce(createdUser);

    const result = await dbCreateUser.create(params);

    expect(createUserRepository.create).toHaveBeenCalledWith(params);
    expect(result).toEqual(createdUser);
  });
});
