import { UpdateServiceRepository } from '@/application/protocols/db';
import { UpdateService } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbUpdateService } from './db-update-service';

const updateServiceRepositoryMock = (): UpdateServiceRepository => {
  return { update: jest.fn() } as UpdateServiceRepository;
};

describe('DbUpdateService', () => {
  let updateServiceRepository: UpdateServiceRepository;
  let dbUpdateService: DbUpdateService;

  beforeEach(() => {
    updateServiceRepository = updateServiceRepositoryMock();
    dbUpdateService = new DbUpdateService(updateServiceRepository);
  });

  it('should update a service', async () => {
    const params: UpdateService.Params = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
    };
    const updatedService: UpdateService.Result = {
      id: params.id,
      name: params.name || 'Updated Name',
      description: params.description,
      price: params.price || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(updateServiceRepository, 'update').mockResolvedValueOnce(updatedService);

    const result = await dbUpdateService.update(params);

    expect(updateServiceRepository.update).toHaveBeenCalledWith(params);
    expect(result).toEqual(updatedService);
  });
});
