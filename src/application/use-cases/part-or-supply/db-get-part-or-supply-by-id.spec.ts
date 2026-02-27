import { GetPartOrSupplyByIdRepository } from '@/application/protocols/db';
import { GetPartOrSupplyById } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetPartOrSupplyById } from './db-get-part-or-supply-by-id';

const getPartOrSupplyByIdRepositoryMock = (): GetPartOrSupplyByIdRepository => {
  return { getById: jest.fn() } as GetPartOrSupplyByIdRepository;
};

describe('DbGetPartOrSupplyById', () => {
  let getPartOrSupplyByIdRepository: GetPartOrSupplyByIdRepository;
  let dbGetPartOrSupplyById: DbGetPartOrSupplyById;

  beforeEach(() => {
    getPartOrSupplyByIdRepository = getPartOrSupplyByIdRepositoryMock();
    dbGetPartOrSupplyById = new DbGetPartOrSupplyById(getPartOrSupplyByIdRepository);
  });

  it('should return a part or supply by id', async () => {
    const params: GetPartOrSupplyById.Params = {
      id: faker.string.uuid(),
    };
    const partOrSupply: GetPartOrSupplyById.Result = {
      id: params.id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      inStock: faker.number.int({ min: 1, max: 100 }),
      createdAt: new Date(),
      updatedAt: undefined,
    };
    jest.spyOn(getPartOrSupplyByIdRepository, 'getById').mockResolvedValueOnce(partOrSupply);

    const result = await dbGetPartOrSupplyById.getById(params);

    expect(getPartOrSupplyByIdRepository.getById).toHaveBeenCalledWith(params);
    expect(result).toEqual(partOrSupply);
  });
});
