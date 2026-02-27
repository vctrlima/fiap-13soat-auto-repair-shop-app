import { GetAllUsersRepository } from '@/application/protocols/db';
import { Role } from '@/domain/enums';
import { GetAllUsers } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetAllUsers } from './db-get-all-users';

const getAllUsersRepositoryMock = (): GetAllUsersRepository => {
  return { getAll: jest.fn() } as GetAllUsersRepository;
};

describe('DbGetAllUsers', () => {
  let getAllUsersRepository: GetAllUsersRepository;
  let dbGetAllUsers: DbGetAllUsers;

  beforeEach(() => {
    getAllUsersRepository = getAllUsersRepositoryMock();
    dbGetAllUsers = new DbGetAllUsers(getAllUsersRepository);
  });

  it('should return all users with pagination', async () => {
    const params: GetAllUsers.Params = {
      page: 1,
      limit: 10,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: Role.Admin,
    };
    const items = [
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: Role.Admin,
        createdAt: new Date(),
        updatedAt: undefined,
      },
    ];
    const result: GetAllUsers.Result = {
      content: items,
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest.spyOn(getAllUsersRepository, 'getAll').mockResolvedValueOnce(result);

    const response = await dbGetAllUsers.getAll(params);

    expect(getAllUsersRepository.getAll).toHaveBeenCalledWith(params);
    expect(response).toEqual(result);
  });
});
