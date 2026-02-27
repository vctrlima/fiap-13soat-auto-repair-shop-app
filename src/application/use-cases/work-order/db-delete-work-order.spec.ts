import { DeleteWorkOrderRepository } from '@/application/protocols/db';
import { DeleteWorkOrder } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbDeleteWorkOrder } from './db-delete-work-order';

const deleteWorkOrderRepositoryMock = (): DeleteWorkOrderRepository => {
  return { delete: jest.fn() } as DeleteWorkOrderRepository;
};

describe('DbDeleteWorkOrder', () => {
  let deleteWorkOrderRepository: DeleteWorkOrderRepository;
  let dbDeleteWorkOrder: DbDeleteWorkOrder;

  beforeEach(() => {
    deleteWorkOrderRepository = deleteWorkOrderRepositoryMock();
    dbDeleteWorkOrder = new DbDeleteWorkOrder(deleteWorkOrderRepository);
  });

  it('should delete a work order', async () => {
    const params: DeleteWorkOrder.Params = {
      id: faker.string.uuid(),
    };
    jest.spyOn(deleteWorkOrderRepository, 'delete').mockResolvedValueOnce(undefined);

    const result = await dbDeleteWorkOrder.delete(params);

    expect(deleteWorkOrderRepository.delete).toHaveBeenCalledWith(params);
    expect(result).toBeUndefined();
  });
});
