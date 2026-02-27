import { UpdateWorkOrderRepository } from '@/application/protocols/db';
import { SendEmailTransporter } from '@/application/protocols/messaging';
import { Customer, Vehicle } from '@/domain/entities';
import { Status } from '@/domain/enums';
import { UpdateWorkOrder } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbUpdateWorkOrder } from './db-update-work-order';

jest.mock('@/main/config/env', () => ({
  host: 'http://localhost:3000',
  mailing: { enabled: true },
}));

jest.mock('@/main/templates', () => ({
  notificationTemplate: {
    update: jest.fn().mockReturnValue('<html>Update template</html>'),
    approvalRequest: jest.fn().mockReturnValue('<html>Approval template</html>'),
  },
}));

const updateWorkOrderRepositoryMock = (): UpdateWorkOrderRepository => {
  return { update: jest.fn() } as UpdateWorkOrderRepository;
};

const sendEmailTransporterMock = (): SendEmailTransporter => {
  return { send: jest.fn() } as SendEmailTransporter;
};

describe('DbUpdateWorkOrder', () => {
  let updateWorkOrderRepository: UpdateWorkOrderRepository;
  let sendEmailTransporter: SendEmailTransporter;
  let dbUpdateWorkOrder: DbUpdateWorkOrder;

  beforeEach(() => {
    updateWorkOrderRepository = updateWorkOrderRepositoryMock();
    sendEmailTransporter = sendEmailTransporterMock();
    dbUpdateWorkOrder = new DbUpdateWorkOrder(updateWorkOrderRepository, sendEmailTransporter);
  });

  it('should update a work order and send update notification when status is not WaitingApproval', async () => {
    const params: UpdateWorkOrder.Params = {
      id: faker.string.uuid(),
      serviceIds: [faker.string.uuid(), faker.string.uuid()],
      partAndSupplyIds: [faker.string.uuid()],
      status: Status.InExecution,
    };

    const customer: Customer = {
      id: faker.string.uuid(),
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };

    const vehicle: Vehicle = {
      id: faker.string.uuid(),
      customer,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1990, max: 2024 }),
      createdAt: new Date(),
      updatedAt: undefined,
    };

    const services = (params.serviceIds || []).map((id) => ({
      id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      createdAt: new Date(),
      updatedAt: undefined,
    }));

    const partsAndSupplies = (params.partAndSupplyIds || []).map((id) => ({
      id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      inStock: faker.number.int({ min: 1, max: 100 }),
      createdAt: new Date(),
      updatedAt: undefined,
    }));

    const updatedWorkOrder: UpdateWorkOrder.Result = {
      id: params.id,
      customer,
      vehicle,
      services,
      partsAndSupplies,
      status: params.status || Status.InExecution,
      budget:
        services.reduce((total, service) => total + service.price, 0) +
        partsAndSupplies.reduce((total, part) => total + part.price, 0),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(updateWorkOrderRepository, 'update').mockResolvedValueOnce(updatedWorkOrder);
    jest.spyOn(sendEmailTransporter, 'send').mockResolvedValueOnce();

    const result = await dbUpdateWorkOrder.update(params);

    expect(updateWorkOrderRepository.update).toHaveBeenCalledWith(params);
    expect(sendEmailTransporter.send).toHaveBeenCalledWith({
      to: customer.email,
      from: 'no-reply@auto-repair-shop.com',
      subject: 'Your service order has been updated!',
      html: '<html>Update template</html>',
    });
    expect(result).toEqual(updatedWorkOrder);

    const { notificationTemplate } = require('@/main/templates');
    expect(notificationTemplate.update).toHaveBeenCalledWith(
      updatedWorkOrder,
      `http://localhost:3000/api/work-orders/${updatedWorkOrder.id}`
    );
  });

  it('should update a work order and send approval request when status is WaitingApproval', async () => {
    const params: UpdateWorkOrder.Params = {
      id: faker.string.uuid(),
      serviceIds: [faker.string.uuid(), faker.string.uuid()],
      partAndSupplyIds: [faker.string.uuid()],
      status: Status.WaitingApproval,
    };

    const customer: Customer = {
      id: faker.string.uuid(),
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };

    const vehicle: Vehicle = {
      id: faker.string.uuid(),
      customer,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1990, max: 2024 }),
      createdAt: new Date(),
      updatedAt: undefined,
    };

    const services = (params.serviceIds || []).map((id) => ({
      id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      createdAt: new Date(),
      updatedAt: undefined,
    }));

    const partsAndSupplies = (params.partAndSupplyIds || []).map((id) => ({
      id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      inStock: faker.number.int({ min: 1, max: 100 }),
      createdAt: new Date(),
      updatedAt: undefined,
    }));

    const updatedWorkOrder: UpdateWorkOrder.Result = {
      id: params.id,
      customer,
      vehicle,
      services,
      partsAndSupplies,
      status: Status.WaitingApproval,
      budget:
        services.reduce((total, service) => total + service.price, 0) +
        partsAndSupplies.reduce((total, part) => total + part.price, 0),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(updateWorkOrderRepository, 'update').mockResolvedValueOnce(updatedWorkOrder);
    jest.spyOn(sendEmailTransporter, 'send').mockResolvedValueOnce();

    const result = await dbUpdateWorkOrder.update(params);

    expect(updateWorkOrderRepository.update).toHaveBeenCalledWith(params);
    expect(sendEmailTransporter.send).toHaveBeenCalledWith({
      to: customer.email,
      from: 'no-reply@auto-repair-shop.com',
      subject: 'Your service order is waiting for approval!',
      html: '<html>Approval template</html>',
    });
    expect(result).toEqual(updatedWorkOrder);

    const { notificationTemplate } = require('@/main/templates');
    expect(notificationTemplate.approvalRequest).toHaveBeenCalledWith(
      updatedWorkOrder,
      `http://localhost:3000/api/work-orders/${updatedWorkOrder.id}`
    );
  });

  it('should handle email sending failure gracefully', async () => {
    const params: UpdateWorkOrder.Params = {
      id: faker.string.uuid(),
      status: Status.Finished,
    };

    const customer: Customer = {
      id: faker.string.uuid(),
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };

    const vehicle: Vehicle = {
      id: faker.string.uuid(),
      customer,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1990, max: 2024 }),
      createdAt: new Date(),
      updatedAt: undefined,
    };

    const updatedWorkOrder: UpdateWorkOrder.Result = {
      id: params.id,
      customer,
      vehicle,
      services: [],
      partsAndSupplies: [],
      status: Status.Finished,
      budget: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(updateWorkOrderRepository, 'update').mockResolvedValueOnce(updatedWorkOrder);
    jest.spyOn(sendEmailTransporter, 'send').mockRejectedValueOnce(new Error('Email service unavailable'));

    await expect(dbUpdateWorkOrder.update(params)).rejects.toThrow('Email service unavailable');
    expect(updateWorkOrderRepository.update).toHaveBeenCalledWith(params);
    expect(sendEmailTransporter.send).toHaveBeenCalled();
  });

  it('should handle email sending failure gracefully when status is WaitingApproval', async () => {
    const params: UpdateWorkOrder.Params = {
      id: faker.string.uuid(),
      status: Status.WaitingApproval,
    };

    const customer: Customer = {
      id: faker.string.uuid(),
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };

    const vehicle: Vehicle = {
      id: faker.string.uuid(),
      customer,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1990, max: 2024 }),
      createdAt: new Date(),
      updatedAt: undefined,
    };

    const updatedWorkOrder: UpdateWorkOrder.Result = {
      id: params.id,
      customer,
      vehicle,
      services: [],
      partsAndSupplies: [],
      status: Status.WaitingApproval,
      budget: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(updateWorkOrderRepository, 'update').mockResolvedValueOnce(updatedWorkOrder);
    jest.spyOn(sendEmailTransporter, 'send').mockRejectedValueOnce(new Error('Email service unavailable'));

    await expect(dbUpdateWorkOrder.update(params)).rejects.toThrow('Email service unavailable');
    expect(updateWorkOrderRepository.update).toHaveBeenCalledWith(params);
    expect(sendEmailTransporter.send).toHaveBeenCalledWith({
      to: customer.email,
      from: 'no-reply@auto-repair-shop.com',
      subject: 'Your service order is waiting for approval!',
      html: expect.any(String),
    });
  });
});
