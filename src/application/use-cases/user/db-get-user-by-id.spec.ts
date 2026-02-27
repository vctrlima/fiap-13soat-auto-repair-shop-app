import { GetUserByIdRepository } from '@/application/protocols/db';
import { Role } from '@/domain/enums';
import { GetUserById } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetUserById } from './db-get-user-by-id';

const getUserByIdRepositoryMock = (): GetUserByIdRepository => {
  return { getById: jest.fn() } as GetUserByIdRepository;
};

describe('DbGetUserById', () => {
  let getUserByIdRepository: GetUserByIdRepository;
  let dbGetUserById: DbGetUserById;

  beforeEach(() => {
    getUserByIdRepository = getUserByIdRepositoryMock();
    dbGetUserById = new DbGetUserById(getUserByIdRepository);
  });

  it('should return a user by id', async () => {
    const params: GetUserById.Params = {
      id: faker.string.uuid(),
    };
    const user: GetUserById.Result = {
      id: params.id,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: Role.Admin,
      createdAt: new Date(),
      updatedAt: undefined,
    };
    jest.spyOn(getUserByIdRepository, 'getById').mockResolvedValueOnce(user);

    const result = await dbGetUserById.getById(params);

    expect(getUserByIdRepository.getById).toHaveBeenCalledWith(params);
    expect(result).toEqual(user);
  });
});
