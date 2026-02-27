import { Customer, Vehicle } from '@/domain/entities';
import { CreateVehicle } from '@/domain/use-cases';
import { created } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { LicensePlateValidator } from '@/validation/validators';
import { faker } from '@faker-js/faker';
import { CreateVehicleController } from './create-vehicle-controller';

const createVehicleMock = (): CreateVehicle => ({
  create: jest.fn(),
});

const licensePlateValidatorMock = (): LicensePlateValidator =>
  ({
    validate: jest.fn(),
  } as any);

describe('CreateVehicleController', () => {
  let licensePlateValidator: LicensePlateValidator;
  let createVehicle: CreateVehicle;
  let createVehicleController: CreateVehicleController;

  beforeEach(() => {
    createVehicle = createVehicleMock();
    licensePlateValidator = licensePlateValidatorMock();
    createVehicleController = new CreateVehicleController(createVehicle, licensePlateValidator);
  });

  it('should create a new vehicle and return 200 OK', async () => {
    const customer: Customer = {
      id: faker.string.uuid(),
      document: faker.string.numeric(11),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      createdAt: new Date(),
      updatedAt: null,
    };
    const request: HttpRequest<CreateVehicle.Params> = {
      body: {
        customerId: customer.id,
        licensePlate: faker.string.alphanumeric(7).toUpperCase(),
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.number.int({ min: 1990, max: 2024 }),
      },
    };
    const vehicle: Vehicle = {
      id: faker.string.uuid(),
      customer,
      licensePlate: request.body?.licensePlate as string,
      brand: request.body?.brand as string,
      model: request.body?.model as string,
      year: request.body?.year as number,
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(createVehicle, 'create').mockResolvedValue(vehicle);

    const response = await createVehicleController.handle(request);

    expect(response).toEqual(created(vehicle));
    expect(createVehicle.create).toHaveBeenCalledWith(request.body);
  });

  it('should return 500 ServerError if CreateVehicle throws', async () => {
    const request: HttpRequest<CreateVehicle.Params> = {
      body: {
        customerId: faker.string.uuid(),
        licensePlate: faker.string.alphanumeric(7).toUpperCase(),
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.number.int({ min: 1990, max: 2024 }),
      },
    };
    jest.spyOn(createVehicle, 'create').mockRejectedValue(new Error());

    const response = await createVehicleController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
