import { CreatePartOrSupplyRepository } from '@/application/protocols/db';
import { CreatePartOrSupply } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbCreatePartOrSupply } from './db-create-part-or-supply';

const createPartOrSupplyRepositoryMock = (): CreatePartOrSupplyRepository => {
  return { create: jest.fn() } as CreatePartOrSupplyRepository;
};

describe('DbCreatePartOrSupply', () => {
  let createPartOrSupplyRepository: CreatePartOrSupplyRepository;
  let dbCreatePartOrSupply: DbCreatePartOrSupply;

  beforeEach(() => {
    createPartOrSupplyRepository = createPartOrSupplyRepositoryMock();
    dbCreatePartOrSupply = new DbCreatePartOrSupply(createPartOrSupplyRepository);
  });

  it('should create a new part or supply', async () => {
    const params: CreatePartOrSupply.Params = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      inStock: faker.number.int({ min: 1, max: 100 }),
    };
    const createdPartOrSupply: CreatePartOrSupply.Result = {
      id: faker.string.uuid(),
      name: params.name,
      description: params.description,
      price: params.price,
      inStock: params.inStock,
      createdAt: new Date(),
      updatedAt: undefined,
    };
    jest.spyOn(createPartOrSupplyRepository, 'create').mockResolvedValueOnce(createdPartOrSupply);

    const result = await dbCreatePartOrSupply.create(params);

    expect(createPartOrSupplyRepository.create).toHaveBeenCalledWith(params);
    expect(result).toEqual(createdPartOrSupply);
  });
});
