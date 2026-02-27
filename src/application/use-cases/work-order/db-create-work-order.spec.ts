import { CreateWorkOrderRepository } from '@/application/protocols/db';
import { SendEmailTransporter } from '@/application/protocols/messaging';
import { Status } from '@/domain/enums';
import { CreateWorkOrder } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbCreateWorkOrder } from './db-create-work-order';

jest.mock('@/main/config/env', () => ({
  host: 'http://localhost:3000',
  mailing: { enabled: true },
}));

jest.mock('@/main/templates', () => ({
  notificationTemplate: {
    create: jest.fn().mockReturnValue('<html>Create template</html>'),
  },
}));

const createWorkOrderRepositoryMock = (): CreateWorkOrderRepository => {
  return { create: jest.fn() } as CreateWorkOrderRepository;
};

const sendEmailTransporterMock = (): SendEmailTransporter => {
  return { send: jest.fn() } as SendEmailTransporter;
};

describe('DbCreateWorkOrder', () => {
  let createWorkOrderRepository: CreateWorkOrderRepository;
  let sendEmailTransporter: SendEmailTransporter;
  let dbCreateWorkOrder: DbCreateWorkOrder;

  beforeEach(() => {
    createWorkOrderRepository = createWorkOrderRepositoryMock();
    sendEmailTransporter = sendEmailTransporterMock();
    dbCreateWorkOrder = new DbCreateWorkOrder(createWorkOrderRepository, sendEmailTransporter);
  });

  it('should create a new work order', async () => {
    const params: CreateWorkOrder.Params = {
      customerId: faker.string.uuid(),
      vehicleId: faker.string.uuid(),
      serviceIds: [faker.string.uuid(), faker.string.uuid()],
      partAndSupplyIds: [faker.string.uuid()],
      status: Status.Received,
    };

    const customer = {
      id: params.customerId,
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };

    const vehicle = {
      id: params.vehicleId,
      customer,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1990, max: 2024 }),
      createdAt: new Date(),
      updatedAt: undefined,
    };

    const services = params.serviceIds.map((id) => ({
      id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      createdAt: new Date(),
      updatedAt: undefined,
    }));

    const partsAndSupplies =
      params.partAndSupplyIds?.map((id) => ({
        id,
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        inStock: faker.number.int({ min: 1, max: 100 }),
        createdAt: new Date(),
        updatedAt: undefined,
      })) || [];

    const createdWorkOrder: CreateWorkOrder.Result = {
      id: faker.string.uuid(),
      customer,
      vehicle,
      services,
      partsAndSupplies,
      status: params.status || Status.Received,
      budget:
        services.reduce((total, service) => total + service.price, 0) +
        partsAndSupplies.reduce((total, part) => total + part.price, 0),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(createWorkOrderRepository, 'create').mockResolvedValueOnce(createdWorkOrder);
    jest.spyOn(sendEmailTransporter, 'send').mockResolvedValueOnce();

    const result = await dbCreateWorkOrder.create(params);

    expect(createWorkOrderRepository.create).toHaveBeenCalledWith(params);
    expect(sendEmailTransporter.send).toHaveBeenCalledWith({
      to: customer.email,
      from: 'no-reply@auto-repair-shop.com',
      subject: 'Your service order has been created!',
      html: '<html>Create template</html>',
    });

    const { notificationTemplate } = require('@/main/templates');
    expect(notificationTemplate.create).toHaveBeenCalledWith(
      createdWorkOrder,
      `http://localhost:3000/api/work-orders/${createdWorkOrder.id}`
    );
    expect(result).toEqual(createdWorkOrder);
  });

  it('should handle email sending failure gracefully', async () => {
    const params: CreateWorkOrder.Params = {
      customerId: faker.string.uuid(),
      vehicleId: faker.string.uuid(),
      serviceIds: [faker.string.uuid()],
      status: Status.Received,
    };

    const customer = {
      id: params.customerId,
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };

    const vehicle = {
      id: params.vehicleId,
      customer,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1990, max: 2024 }),
      createdAt: new Date(),
      updatedAt: undefined,
    };

    const services = params.serviceIds.map((id) => ({
      id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      createdAt: new Date(),
      updatedAt: undefined,
    }));

    const createdWorkOrder: CreateWorkOrder.Result = {
      id: faker.string.uuid(),
      customer,
      vehicle,
      services,
      partsAndSupplies: [],
      status: Status.Received,
      budget: services.reduce((total, service) => total + service.price, 0),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(createWorkOrderRepository, 'create').mockResolvedValueOnce(createdWorkOrder);
    jest.spyOn(sendEmailTransporter, 'send').mockRejectedValueOnce(new Error('Email service unavailable'));

    await expect(dbCreateWorkOrder.create(params)).rejects.toThrow('Email service unavailable');
    expect(createWorkOrderRepository.create).toHaveBeenCalledWith(params);
    expect(sendEmailTransporter.send).toHaveBeenCalled();
  });
});
