import { Customer, Vehicle } from '@/domain/entities';
import { GetVehicleById } from '@/domain/use-cases';
import { ok } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { GetVehicleByIdController } from './get-vehicle-by-id-controller';

const getVehicleByIdMock = (): GetVehicleById => ({
  getById: jest.fn(),
});

describe('GetVehicleByIdController', () => {
  let getVehicleById: GetVehicleById;
  let getVehicleByIdController: GetVehicleByIdController;

  beforeEach(() => {
    getVehicleById = getVehicleByIdMock();
    getVehicleByIdController = new GetVehicleByIdController(getVehicleById);
  });

  it('should get vehicle by id and return 200 OK', async () => {
    const id = faker.string.uuid();
    const request: HttpRequest<GetVehicleById.Params> = {
      params: { id },
    };
    const customer: Customer = {
      id: faker.string.uuid(),
      document: faker.string.numeric(11),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      createdAt: new Date(),
      updatedAt: null,
    };
    const vehicle: Vehicle = {
      id,
      customer,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1990, max: 2024 }),
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(getVehicleById, 'getById').mockResolvedValue(vehicle);

    const response = await getVehicleByIdController.handle(request);

    expect(response).toEqual(ok(vehicle));
    expect(getVehicleById.getById).toHaveBeenCalledWith({ id });
  });

  it('should return 500 ServerError if GetVehicleById throws', async () => {
    const request: HttpRequest<GetVehicleById.Params> = {
      params: { id: faker.string.uuid() },
    };
    jest.spyOn(getVehicleById, 'getById').mockRejectedValue(new Error());

    const response = await getVehicleByIdController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
