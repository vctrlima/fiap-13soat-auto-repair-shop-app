import { DeleteUserRepository } from '@/application/protocols/db';
import { DeleteUser } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbDeleteUser } from './db-delete-user';

const deleteUserRepositoryMock = (): DeleteUserRepository => {
  return { delete: jest.fn() } as DeleteUserRepository;
};

describe('DbDeleteUser', () => {
  let deleteUserRepository: DeleteUserRepository;
  let dbDeleteUser: DbDeleteUser;

  beforeEach(() => {
    deleteUserRepository = deleteUserRepositoryMock();
    dbDeleteUser = new DbDeleteUser(deleteUserRepository);
  });

  it('should delete a user', async () => {
    const params: DeleteUser.Params = {
      id: faker.string.uuid(),
    };
    jest.spyOn(deleteUserRepository, 'delete').mockResolvedValueOnce(undefined);

    const result = await dbDeleteUser.delete(params);

    expect(deleteUserRepository.delete).toHaveBeenCalledWith(params);
    expect(result).toBeUndefined();
  });
});
