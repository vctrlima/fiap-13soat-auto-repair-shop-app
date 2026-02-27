import { User } from '@/domain/entities';
import { Role } from '@/domain/enums';
import { GetAllUsers } from '@/domain/use-cases';
import { ok } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { GetAllUsersController } from './get-all-users-controller';

const getAllUsersMock = (): GetAllUsers => ({
  getAll: jest.fn(),
});

describe('GetAllUsersController', () => {
  let getAllUsers: GetAllUsers;
  let getAllUsersController: GetAllUsersController;

  beforeEach(() => {
    getAllUsers = getAllUsersMock();
    getAllUsersController = new GetAllUsersController(getAllUsers);
  });

  it('should get all users and return 200 OK', async () => {
    const users: Omit<User, 'password'>[] = [
      {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: Role.Default,
        createdAt: new Date(),
      },
      {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: Role.Admin,
        createdAt: new Date(),
      },
    ];
    const page: GetAllUsers.Result = {
      content: users,
      limit: 10,
      page: 1,
      total: 2,
      totalPages: 1,
    };
    const request: HttpRequest<GetAllUsers.Params> = {
      query: { page: 1, limit: 10 },
    };
    jest.spyOn(getAllUsers, 'getAll').mockResolvedValue(page);

    const response = await getAllUsersController.handle(request);

    expect(getAllUsers.getAll).toHaveBeenCalledWith(request.query);
    expect(response).toEqual(ok(page));
  });

  it('should return 500 Server Error if an error occurs', async () => {
    jest.spyOn(getAllUsers, 'getAll').mockRejectedValue(new Error('Error'));
    const request: HttpRequest = {};

    const response = await getAllUsersController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
