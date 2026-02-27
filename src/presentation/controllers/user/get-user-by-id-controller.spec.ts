import { Role } from '@/domain/enums';
import { GetUserById } from '@/domain/use-cases';
import { MissingParamError } from '@/presentation/errors';
import { ok } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { GetUserByIdController } from './get-user-by-id-controller';

const getUserByIdMock = (): GetUserById => ({
  getById: jest.fn(),
});

describe('GetUserByIdController', () => {
  let getUserById: GetUserById;
  let getUserByIdController: GetUserByIdController;

  beforeEach(() => {
    getUserById = getUserByIdMock();
    getUserByIdController = new GetUserByIdController(getUserById);
  });

  it('should get a user by id and return 200 OK', async () => {
    const id = faker.string.uuid();
    const email = faker.internet.email();
    const name = faker.person.fullName();
    const role = Role.Default;
    const createdAt = new Date();
    const user: GetUserById.Result = {
      id,
      email,
      name,
      role,
      createdAt,
    };
    jest.spyOn(getUserById, 'getById').mockResolvedValue(user);
    const request: HttpRequest<GetUserById.Params> = { params: { id } };

    const response = await getUserByIdController.handle(request);

    expect(getUserById.getById).toHaveBeenCalledWith({ id });
    expect(response).toEqual(ok(user));
  });

  it('should return 400 Bad Request if id param is missing', async () => {
    const request: HttpRequest<GetUserById.Params> = { params: {} };

    const response = await getUserByIdController.handle(request);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(new MissingParamError('id'));
  });

  it('should return 400 Bad Request if params is missing', async () => {
    const request: HttpRequest<GetUserById.Params> = {};

    const response = await getUserByIdController.handle(request);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(new MissingParamError('id'));
  });

  it('should return 500 Server Error if an error occurs', async () => {
    const id = faker.string.uuid();
    jest.spyOn(getUserById, 'getById').mockRejectedValue(new Error('Error'));
    const request: HttpRequest<GetUserById.Params> = { params: { id } };

    const response = await getUserByIdController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
