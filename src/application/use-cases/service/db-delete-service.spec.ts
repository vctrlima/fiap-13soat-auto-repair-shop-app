import { DeleteServiceRepository } from '@/application/protocols/db';
import { DeleteService } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbDeleteService } from './db-delete-service';

const deleteServiceRepositoryMock = (): DeleteServiceRepository => {
  return { delete: jest.fn() } as DeleteServiceRepository;
};

describe('DbDeleteService', () => {
  let deleteServiceRepository: DeleteServiceRepository;
  let dbDeleteService: DbDeleteService;

  beforeEach(() => {
    deleteServiceRepository = deleteServiceRepositoryMock();
    dbDeleteService = new DbDeleteService(deleteServiceRepository);
  });

  it('should delete a service', async () => {
    const params: DeleteService.Params = {
      id: faker.string.uuid(),
    };
    jest.spyOn(deleteServiceRepository, 'delete').mockResolvedValueOnce(undefined);

    const result = await dbDeleteService.delete(params);

    expect(deleteServiceRepository.delete).toHaveBeenCalledWith(params);
    expect(result).toBeUndefined();
  });
});
