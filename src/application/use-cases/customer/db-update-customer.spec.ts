import { UpdateCustomerRepository } from '@/application/protocols/db';
import { UpdateCustomer } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbUpdateCustomer } from './db-update-customer';

const updateCustomerRepositoryMock = (): UpdateCustomerRepository => {
  return { update: jest.fn() } as UpdateCustomerRepository;
};

describe('DbUpdateCustomer', () => {
  let updateCustomerRepository: UpdateCustomerRepository;
  let dbUpdateCustomer: DbUpdateCustomer;

  beforeEach(() => {
    updateCustomerRepository = updateCustomerRepositoryMock();
    dbUpdateCustomer = new DbUpdateCustomer(updateCustomerRepository);
  });

  it('should update an existing customer', async () => {
    const params: UpdateCustomer.Params = {
      document: faker.string.numeric(11),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number({ style: 'international' }),
    };
    const updatedCase: UpdateCustomer.Result = {
      document: params.document,
    } as UpdateCustomer.Result;
    jest.spyOn(updateCustomerRepository, 'update').mockResolvedValueOnce(updatedCase);

    const result = await dbUpdateCustomer.update(params);

    expect(updateCustomerRepository.update).toHaveBeenCalledWith(params);
    expect(result).toEqual(updatedCase);
  });
});
