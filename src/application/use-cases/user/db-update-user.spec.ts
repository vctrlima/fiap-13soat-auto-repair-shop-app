import { Hasher } from '@/application/protocols/cryptography/hasher';
import { UpdateUserRepository } from '@/application/protocols/db/user';
import { Role } from '@/domain/enums';
import { UpdateUser } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbUpdateUser } from './db-update-user';

const updateUserRepositoryMock = (): UpdateUserRepository => {
  return { update: jest.fn() } as UpdateUserRepository;
};

const hasherMock = (): Hasher => {
  return { hash: jest.fn() } as Hasher;
};

describe('DbUpdateUser', () => {
  let updateUserRepository: UpdateUserRepository;
  let dbUpdateUser: DbUpdateUser;
  let hasher: Hasher;

  beforeEach(() => {
    updateUserRepository = updateUserRepositoryMock();
    hasher = hasherMock();
    dbUpdateUser = new DbUpdateUser(updateUserRepository, hasher);
  });

  it('should update a user', async () => {
    const params: UpdateUser.Params = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: Role.Admin as Role,
    };
    const updatedUser: UpdateUser.Result = {
      id: params.id,
      name: params.name || 'User Name',
      email: params.email || 'user@email.com',
      role: params.role || (Role.Default as Role),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(updateUserRepository, 'update').mockResolvedValueOnce(updatedUser);

    const result = await dbUpdateUser.update(params);

    expect(updateUserRepository.update).toHaveBeenCalledWith(params);
    expect(result).toEqual(updatedUser);
  });
});
