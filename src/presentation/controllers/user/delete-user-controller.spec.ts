import { DeleteUser } from '@/domain/use-cases';
import { MissingParamError, ServerError } from '@/presentation/errors';
import { badRequest, noContent, serverError } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { DeleteUserController } from './delete-user-controller';

const deleteUserMock = (): DeleteUser => ({
  delete: jest.fn(),
});

describe('DeleteUserController', () => {
  let deleteUser: DeleteUser;
  let deleteUserController: DeleteUserController;

  beforeEach(() => {
    deleteUser = deleteUserMock();
    deleteUserController = new DeleteUserController(deleteUser);
  });

  it('should delete an existing user and return 204 No Content', async () => {
    const id = faker.string.uuid();
    jest.spyOn(deleteUser, 'delete').mockResolvedValue();
    const request: HttpRequest = { params: { id } };

    const response = await deleteUserController.handle(request);

    expect(deleteUser.delete).toHaveBeenCalledWith({ id });
    expect(response).toEqual(noContent());
  });

  it('should throw MissingParamError if id is not provided', async () => {
    const request: HttpRequest = {};

    const response = await deleteUserController.handle(request);

    expect(response).toEqual(badRequest(new MissingParamError('id')));
  });

  it('should return 500 if an error occurs', async () => {
    const id = faker.string.uuid();
    jest.spyOn(deleteUser, 'delete').mockRejectedValue(new Error('error'));
    const request: HttpRequest = { params: { id } };

    const response = await deleteUserController.handle(request);

    expect(response).toEqual(serverError(new ServerError('Internal server error')));
  });
});
