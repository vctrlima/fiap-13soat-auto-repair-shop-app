import { GetServiceByIdRepository } from '@/application/protocols/db';
import { GetServiceById } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetServiceById } from './db-get-service-by-id';

const getServiceByIdRepositoryMock = (): GetServiceByIdRepository => {
  return { getById: jest.fn() } as GetServiceByIdRepository;
};

describe('DbGetServiceById', () => {
  let getServiceByIdRepository: GetServiceByIdRepository;
  let dbGetServiceById: DbGetServiceById;

  beforeEach(() => {
    getServiceByIdRepository = getServiceByIdRepositoryMock();
    dbGetServiceById = new DbGetServiceById(getServiceByIdRepository);
  });

  it('should return a service by id', async () => {
    const params: GetServiceById.Params = {
      id: faker.string.uuid(),
    };
    const service: GetServiceById.Result = {
      id: params.id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      createdAt: new Date(),
      updatedAt: undefined,
    };
    jest.spyOn(getServiceByIdRepository, 'getById').mockResolvedValueOnce(service);

    const result = await dbGetServiceById.getById(params);

    expect(getServiceByIdRepository.getById).toHaveBeenCalledWith(params);
    expect(result).toEqual(service);
  });
});
