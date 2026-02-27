import { DeleteCustomerRepository } from '@/application/protocols/db';
import { DeleteCustomer } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbDeleteCustomer } from './db-delete-customer';

const deleteCustomerRepositoryMock = (): DeleteCustomerRepository => {
  return { delete: jest.fn() } as DeleteCustomerRepository;
};

describe('DbDeleteCustomer', () => {
  let deleteCustomerRepository: DeleteCustomerRepository;
  let dbDeleteCustomer: DbDeleteCustomer;

  beforeEach(() => {
    deleteCustomerRepository = deleteCustomerRepositoryMock();
    dbDeleteCustomer = new DbDeleteCustomer(deleteCustomerRepository);
  });

  it('should delete an existing customer', async () => {
    const params: DeleteCustomer.Params = { document: faker.string.uuid() };

    await dbDeleteCustomer.delete(params);

    expect(deleteCustomerRepository.delete).toHaveBeenCalledWith(params);
  });
});
