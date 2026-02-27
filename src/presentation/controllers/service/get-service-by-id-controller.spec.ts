import { Service } from '@/domain/entities';
import { GetServiceById } from '@/domain/use-cases';
import { ok } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { GetServiceByIdController } from './get-service-by-id-controller';

const getServiceByIdMock = (): GetServiceById => ({
  getById: jest.fn(),
});

describe('GetServiceByIdController', () => {
  let getServiceById: GetServiceById;
  let getServiceByIdController: GetServiceByIdController;

  beforeEach(() => {
    getServiceById = getServiceByIdMock();
    getServiceByIdController = new GetServiceByIdController(getServiceById);
  });

  it('should get service by id and return 200 OK', async () => {
    const id = faker.string.uuid();
    const request: HttpRequest<GetServiceById.Params> = {
      params: { id },
    };
    const service: Service = {
      id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(getServiceById, 'getById').mockResolvedValue(service);

    const response = await getServiceByIdController.handle(request);

    expect(response).toEqual(ok(service));
    expect(getServiceById.getById).toHaveBeenCalledWith({ id });
  });

  it('should return 500 ServerError if GetServiceById throws', async () => {
    const request: HttpRequest<GetServiceById.Params> = {
      params: { id: faker.string.uuid() },
    };
    jest.spyOn(getServiceById, 'getById').mockRejectedValue(new Error());

    const response = await getServiceByIdController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
