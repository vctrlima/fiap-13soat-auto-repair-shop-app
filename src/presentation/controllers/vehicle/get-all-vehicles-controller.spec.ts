import { Customer, Vehicle } from '@/domain/entities';
import { GetAllVehicles } from '@/domain/use-cases';
import { ok } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { GetAllVehiclesController } from './get-all-vehicles-controller';

const getAllVehiclesMock = (): GetAllVehicles => ({
  getAll: jest.fn(),
});

describe('GetAllVehiclesController', () => {
  let getAllVehicles: GetAllVehicles;
  let getAllVehiclesController: GetAllVehiclesController;

  beforeEach(() => {
    getAllVehicles = getAllVehiclesMock();
    getAllVehiclesController = new GetAllVehiclesController(getAllVehicles);
  });

  it('should get all vehicles and return 200 OK', async () => {
    const request: HttpRequest<GetAllVehicles.Params> = {
      query: {
        page: 1,
        limit: 10,
        customerId: faker.string.uuid(),
        licensePlate: faker.string.alphanumeric(7).toUpperCase(),
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.number.int({ min: 1990, max: 2024 }),
      },
    };
    const customer: Customer = {
      id: request.query.customerId,
      document: faker.string.numeric(11),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      createdAt: new Date(),
      updatedAt: null,
    };
    const vehicles: Vehicle[] = [
      {
        id: faker.string.uuid(),
        customer,
        licensePlate: request.query.licensePlate,
        brand: request.query.brand,
        model: request.query.model,
        year: request.query.year,
        createdAt: new Date(),
        updatedAt: null,
      },
    ];
    const result: GetAllVehicles.Result = {
      content: vehicles,
      total: vehicles.length,
      page: request.query.page,
      limit: request.query.limit,
      totalPages: 1,
    };
    jest.spyOn(getAllVehicles, 'getAll').mockResolvedValue(result);

    const response = await getAllVehiclesController.handle(request);

    expect(response).toEqual(ok(result));
    expect(getAllVehicles.getAll).toHaveBeenCalledWith(request.query);
  });

  it('should return 500 ServerError if GetAllVehicles throws', async () => {
    const request: HttpRequest<GetAllVehicles.Params> = {
      query: {
        page: 1,
        limit: 10,
      },
    };
    jest.spyOn(getAllVehicles, 'getAll').mockRejectedValue(new Error());

    const response = await getAllVehiclesController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
