import { CreateCustomerRepository } from '@/application/protocols/db';
import { CreateCustomer } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbCreateCustomer } from './db-create-customer';

const createCustomerRepositoryMock = (): CreateCustomerRepository => {
  return { create: jest.fn() } as CreateCustomerRepository;
};

describe('DbCreateCustomer', () => {
  let createCustomerRepository: CreateCustomerRepository;
  let dbCreateCustomer: DbCreateCustomer;

  beforeEach(() => {
    createCustomerRepository = createCustomerRepositoryMock();
    dbCreateCustomer = new DbCreateCustomer(createCustomerRepository);
  });

  it('should create a new customer', async () => {
    const params: CreateCustomer.Params = {
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number({ style: 'international' }),
    };
    const createdCustomer: CreateCustomer.Result = {
      id: faker.string.uuid(),
      document: params.document,
      email: params.email,
      name: params.name,
      phone: params.phone,
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(createCustomerRepository, 'create').mockResolvedValueOnce(createdCustomer);

    const result = await dbCreateCustomer.create(params);

    expect(createCustomerRepository.create).toHaveBeenCalledWith(params);
    expect(result).toEqual(createdCustomer);
  });
});
