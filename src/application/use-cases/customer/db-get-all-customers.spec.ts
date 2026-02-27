import { GetAllCustomersRepository } from '@/application/protocols/db';
import { OrderDirection } from '@/domain/types';
import { GetAllCustomers } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetAllCustomers } from './db-get-all-customers';

const getAllCustomersRepositoryMock = (): GetAllCustomersRepository => {
  return { getAll: jest.fn() } as GetAllCustomersRepository;
};

describe('DbGetAllCustomers', () => {
  let getAllCustomersRepository: GetAllCustomersRepository;
  let dbGetAllCustomers: DbGetAllCustomers;

  beforeEach(() => {
    getAllCustomersRepository = getAllCustomersRepositoryMock();
    dbGetAllCustomers = new DbGetAllCustomers(getAllCustomersRepository);
  });

  it('should get all customers', async () => {
    const params: GetAllCustomers.Params = {
      page: faker.number.int(),
      limit: faker.number.int(),
      orderBy: 'id',
      orderDirection: OrderDirection.ASC,
    };
    const cases: GetAllCustomers.Result = {
      page: params.page as number,
      limit: params.limit as number,
      total: faker.number.int(),
      totalPages: faker.number.int(),
      content: [
        {
          id: faker.string.uuid(),
          document: faker.string.numeric(11),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          phone: faker.phone.number({ style: 'international' }),
          vehicles: [],
          createdAt: new Date(),
          updatedAt: null,
        },
        {
          id: faker.string.uuid(),
          document: faker.string.numeric(11),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          phone: faker.phone.number({ style: 'international' }),
          vehicles: [],
          createdAt: new Date(),
          updatedAt: null,
        },
      ],
    };
    jest.spyOn(getAllCustomersRepository, 'getAll').mockResolvedValueOnce(cases);

    const result = await dbGetAllCustomers.getAll(params);

    expect(getAllCustomersRepository.getAll).toHaveBeenCalledWith(params);
    expect(result).toEqual(cases);
  });
});
