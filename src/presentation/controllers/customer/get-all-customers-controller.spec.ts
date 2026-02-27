import { Customer } from '@/domain/entities';
import { GetAllCustomers } from '@/domain/use-cases';
import { ok } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { GetAllCustomersController } from './get-all-customers-controller';

const getAllCustomersMock = (): GetAllCustomers => ({
  getAll: jest.fn(),
});

describe('GetAllCustomersController', () => {
  let getAllCustomers: GetAllCustomers;
  let getAllCustomersController: GetAllCustomersController;

  beforeEach(() => {
    getAllCustomers = getAllCustomersMock();
    getAllCustomersController = new GetAllCustomersController(getAllCustomers);
  });

  it('should get all customers and return 200 OK', async () => {
    const request: HttpRequest<GetAllCustomers.Params> = {
      query: {
        page: 1,
        limit: 10,
        name: faker.person.fullName(),
        document: faker.string.numeric(11),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
    };
    const customers: Customer[] = [
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        document: faker.string.numeric(11),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        createdAt: new Date(),
        updatedAt: null,
      },
    ];
    const result: GetAllCustomers.Result = {
      content: customers,
      total: customers.length,
      page: request.query.page,
      limit: request.query.limit,
      totalPages: 1,
    };
    jest.spyOn(getAllCustomers, 'getAll').mockResolvedValue(result);

    const response = await getAllCustomersController.handle(request);

    expect(response).toEqual(ok(result));
    expect(getAllCustomers.getAll).toHaveBeenCalledWith(request.query);
  });

  it('should return 500 ServerError if GetAllCustomers throws', async () => {
    const request: HttpRequest<GetAllCustomers.Params> = {
      query: {
        page: 1,
        limit: 10,
      },
    };
    jest.spyOn(getAllCustomers, 'getAll').mockRejectedValue(new Error());

    const response = await getAllCustomersController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
