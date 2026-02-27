import { GetAllPartsOrSuppliesRepository } from '@/application/protocols/db';
import { GetAllPartsOrSupplies } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetAllPartsOrSupplies } from './db-get-all-parts-or-supplies';

const getAllPartsOrSuppliesRepositoryMock = (): GetAllPartsOrSuppliesRepository => {
  return { getAll: jest.fn() } as GetAllPartsOrSuppliesRepository;
};

describe('DbGetAllPartsOrSupplies', () => {
  let getAllPartsOrSuppliesRepository: GetAllPartsOrSuppliesRepository;
  let dbGetAllPartsOrSupplies: DbGetAllPartsOrSupplies;

  beforeEach(() => {
    getAllPartsOrSuppliesRepository = getAllPartsOrSuppliesRepositoryMock();
    dbGetAllPartsOrSupplies = new DbGetAllPartsOrSupplies(getAllPartsOrSuppliesRepository);
  });

  it('should return all parts or supplies with pagination', async () => {
    const params: GetAllPartsOrSupplies.Params = {
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
        inStock: faker.number.int({ min: 1, max: 100 }),
        createdAt: new Date(),
        updatedAt: undefined,
      },
    ];
    const result: GetAllPartsOrSupplies.Result = {
      content: items,
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest.spyOn(getAllPartsOrSuppliesRepository, 'getAll').mockResolvedValueOnce(result);

    const response = await dbGetAllPartsOrSupplies.getAll(params);

    expect(getAllPartsOrSuppliesRepository.getAll).toHaveBeenCalledWith(params);
    expect(response).toEqual(result);
  });
});
