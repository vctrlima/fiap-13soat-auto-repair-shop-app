import { DeletePartOrSupplyRepository } from '@/application/protocols/db';
import { DeletePartOrSupply } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbDeletePartOrSupply } from './db-delete-part-or-supply';

const deletePartOrSupplyRepositoryMock = (): DeletePartOrSupplyRepository => {
  return { delete: jest.fn() } as DeletePartOrSupplyRepository;
};

describe('DbDeletePartOrSupply', () => {
  let deletePartOrSupplyRepository: DeletePartOrSupplyRepository;
  let dbDeletePartOrSupply: DbDeletePartOrSupply;

  beforeEach(() => {
    deletePartOrSupplyRepository = deletePartOrSupplyRepositoryMock();
    dbDeletePartOrSupply = new DbDeletePartOrSupply(deletePartOrSupplyRepository);
  });

  it('should delete a part or supply', async () => {
    const params: DeletePartOrSupply.Params = {
      id: faker.string.uuid(),
    };
    jest.spyOn(deletePartOrSupplyRepository, 'delete').mockResolvedValueOnce(undefined);

    const result = await dbDeletePartOrSupply.delete(params);

    expect(deletePartOrSupplyRepository.delete).toHaveBeenCalledWith(params);
    expect(result).toBeUndefined();
  });
});
