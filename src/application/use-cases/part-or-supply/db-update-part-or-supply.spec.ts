import { UpdatePartOrSupplyRepository } from '@/application/protocols/db';
import { UpdatePartOrSupply } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbUpdatePartOrSupply } from './db-update-part-or-supply';

const updatePartOrSupplyRepositoryMock = (): UpdatePartOrSupplyRepository => {
  return { update: jest.fn() } as UpdatePartOrSupplyRepository;
};

describe('DbUpdatePartOrSupply', () => {
  let updatePartOrSupplyRepository: UpdatePartOrSupplyRepository;
  let dbUpdatePartOrSupply: DbUpdatePartOrSupply;

  beforeEach(() => {
    updatePartOrSupplyRepository = updatePartOrSupplyRepositoryMock();
    dbUpdatePartOrSupply = new DbUpdatePartOrSupply(updatePartOrSupplyRepository);
  });

  it('should update a part or supply', async () => {
    const params: UpdatePartOrSupply.Params = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      inStock: faker.number.int({ min: 1, max: 100 }),
    };
    const updatedPartOrSupply: UpdatePartOrSupply.Result = {
      id: params.id,
      name: params.name!,
      description: params.description,
      price: params.price!,
      inStock: params.inStock!,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(updatePartOrSupplyRepository, 'update').mockResolvedValueOnce(updatedPartOrSupply);

    const result = await dbUpdatePartOrSupply.update(params);

    expect(updatePartOrSupplyRepository.update).toHaveBeenCalledWith(params);
    expect(result).toEqual(updatedPartOrSupply);
  });
});
