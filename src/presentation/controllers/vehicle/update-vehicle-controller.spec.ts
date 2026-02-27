import { Vehicle } from '@/domain/entities';
import { UpdateVehicle } from '@/domain/use-cases';
import { ok } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { LicensePlateValidator } from '@/validation/validators';
import { faker } from '@faker-js/faker';
import { UpdateVehicleController } from './update-vehicle-controller';

const updateVehicleMock = (): UpdateVehicle => ({
  update: jest.fn(),
});

const licensePlateValidatorMock = (): LicensePlateValidator =>
  ({
    validate: jest.fn(),
  } as any);

describe('UpdateVehicleController', () => {
  let licensePlateValidator: LicensePlateValidator;
  let updateVehicle: UpdateVehicle;
  let updateVehicleController: UpdateVehicleController;

  beforeEach(() => {
    updateVehicle = updateVehicleMock();
    licensePlateValidator = licensePlateValidatorMock();
    updateVehicleController = new UpdateVehicleController(updateVehicle, licensePlateValidator);
  });

  it('should update vehicle and return 200 OK', async () => {
    const id = faker.string.uuid();
    const params: UpdateVehicle.Params = {
      id,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1990, max: 2024 }),
    };
    const request: HttpRequest<UpdateVehicle.Params> = {
      body: params,
      params: { id },
    };
    const vehicle = {
      ...params,
      customer: {
        id: faker.string.uuid(),
        document: faker.string.numeric(11),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        createdAt: new Date(),
        updatedAt: null,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Vehicle;
    jest.spyOn(updateVehicle, 'update').mockResolvedValue(vehicle);

    const response = await updateVehicleController.handle(request);

    expect(response).toEqual(ok(vehicle));
    expect(updateVehicle.update).toHaveBeenCalledWith(params);
  });

  it('should return 500 ServerError if UpdateVehicle throws', async () => {
    const id = faker.string.uuid();
    const request: HttpRequest<UpdateVehicle.Params> = {
      body: {
        id,
        licensePlate: faker.string.alphanumeric(7).toUpperCase(),
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.number.int({ min: 1990, max: 2024 }),
      },
      params: { id },
    };
    jest.spyOn(updateVehicle, 'update').mockRejectedValue(new Error());

    const response = await updateVehicleController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
