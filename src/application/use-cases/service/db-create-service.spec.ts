import { CreateServiceRepository } from '@/application/protocols/db';
import { CreateService } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbCreateService } from './db-create-service';

const createServiceRepositoryMock = (): CreateServiceRepository => {
  return { create: jest.fn() } as CreateServiceRepository;
};

describe('DbCreateService', () => {
  let createServiceRepository: CreateServiceRepository;
  let dbCreateService: DbCreateService;

  beforeEach(() => {
    createServiceRepository = createServiceRepositoryMock();
    dbCreateService = new DbCreateService(createServiceRepository);
  });

  it('should create a new service', async () => {
    const params: CreateService.Params = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
    };
    const createdService: CreateService.Result = {
      id: faker.string.uuid(),
      name: params.name,
      description: params.description,
      price: params.price,
      createdAt: new Date(),
      updatedAt: undefined,
    };
    jest.spyOn(createServiceRepository, 'create').mockResolvedValueOnce(createdService);

    const result = await dbCreateService.create(params);

    expect(createServiceRepository.create).toHaveBeenCalledWith(params);
    expect(result).toEqual(createdService);
  });
});
