import { GetAllServicesRepository } from '@/application/protocols/db';
import { GetAllServices } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetAllServices } from './db-get-all-services';

const getAllServicesRepositoryMock = (): GetAllServicesRepository => {
  return { getAll: jest.fn() } as GetAllServicesRepository;
};

describe('DbGetAllServices', () => {
  let getAllServicesRepository: GetAllServicesRepository;
  let dbGetAllServices: DbGetAllServices;

  beforeEach(() => {
    getAllServicesRepository = getAllServicesRepositoryMock();
    dbGetAllServices = new DbGetAllServices(getAllServicesRepository);
  });

  it('should return all services with pagination', async () => {
    const params: GetAllServices.Params = {
      page: 1,
      limit: 10,
      name: faker.commerce.productName(),
    };
    const items = [
      {
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        createdAt: new Date(),
        updatedAt: undefined,
      },
    ];
    const result: GetAllServices.Result = {
      content: items,
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest.spyOn(getAllServicesRepository, 'getAll').mockResolvedValueOnce(result);

    const response = await dbGetAllServices.getAll(params);

    expect(getAllServicesRepository.getAll).toHaveBeenCalledWith(params);
    expect(response).toEqual(result);
  });
});
