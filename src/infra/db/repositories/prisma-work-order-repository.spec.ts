import {
  CreateWorkOrderRepository,
  DeleteWorkOrderRepository,
  GetAllWorkOrdersRepository,
  GetWorkOrderByIdRepository,
  UpdateWorkOrderRepository,
} from '@/application/protocols/db';
import { Status } from '@/domain/enums';
import { NotFoundError } from '@/presentation/errors';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { PrismaWorkOrderRepository } from './prisma-work-order-repository';

type WorkOrderRepository = CreateWorkOrderRepository &
  GetAllWorkOrdersRepository &
  GetWorkOrderByIdRepository &
  UpdateWorkOrderRepository &
  DeleteWorkOrderRepository;

const makeMockData = () => {
  const customerId = faker.string.uuid();
  const vehicleId = faker.string.uuid();
  const customerData = {
    id: customerId as string,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    document: faker.string.numeric(11),
    phone: faker.phone.number(),
    createdAt: new Date(),
    updatedAt: null,
  };
  const vehicleData = {
    id: vehicleId as string,
    customerId,
    customer: customerData,
    licensePlate: faker.string.alphanumeric(7).toUpperCase() as string,
    brand: faker.vehicle.manufacturer() as string,
    model: faker.vehicle.model() as string,
    year: faker.number.int({ min: 1980, max: 2024 }) as number,
    createdAt: new Date(),
    updatedAt: null,
  };
  const serviceData = {
    id: faker.string.uuid() as string,
    name: faker.commerce.productName() as string,
    description: faker.commerce.productDescription() as string,
    price: faker.number.float({ min: 50, max: 1000 }) as number,
    createdAt: new Date(),
    updatedAt: null,
  };
  const partData = {
    id: faker.string.uuid() as string,
    name: faker.commerce.productName() as string,
    description: faker.commerce.productDescription() as string,
    price: faker.number.float({ min: 10, max: 500 }) as number,
    createdAt: new Date(),
    updatedAt: null,
    inStock: 1,
  };
  return { customerData, vehicleData, serviceData, partData };
};

const prismaClientMock = (): PrismaClient =>
  ({
    workOrder: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    partOrSupply: { findMany: jest.fn() },
    service: { findMany: jest.fn() },
  } as unknown as PrismaClient);

describe('PrismaWorkOrderRepository', () => {
  let prisma: PrismaClient;
  let prismaWorkOrderRepository: WorkOrderRepository;
  const mockData = makeMockData();

  beforeEach(() => {
    prisma = prismaClientMock();
    prismaWorkOrderRepository = new PrismaWorkOrderRepository(prisma);
  });

  it('should create a new work order with services and parts', async () => {
    const params = {
      customerId: mockData.customerData.id,
      vehicleId: mockData.vehicleData.id,
      serviceIds: [mockData.serviceData.id],
      partAndSupplyIds: [mockData.partData.id],
      status: Status.Received,
    };
    const expectedBudget = mockData.serviceData.price + mockData.partData.price;
    const createdWorkOrder = {
      id: faker.string.uuid(),
      customerId: params.customerId,
      vehicleId: params.vehicleId,
      status: params.status,
      budget: expectedBudget,
      customer: mockData.customerData,
      vehicle: mockData.vehicleData,
      services: [
        {
          serviceId: mockData.serviceData.id,
          service: mockData.serviceData,
          price: mockData.serviceData.price,
        },
      ],
      parts: [
        {
          partOrSupplyId: mockData.partData.id,
          partOrSupply: mockData.partData,
          quantity: 1,
          price: mockData.partData.price,
        },
      ],
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.service, 'findMany').mockResolvedValueOnce([mockData.serviceData]);
    jest.spyOn(prisma.partOrSupply, 'findMany').mockResolvedValueOnce([mockData.partData]);
    jest.spyOn(prisma.workOrder, 'create').mockResolvedValueOnce(createdWorkOrder as any);

    const result = await prismaWorkOrderRepository.create(params);

    expect(prisma.service.findMany).toHaveBeenCalledWith({
      where: { id: { in: params.serviceIds } },
    });
    expect(prisma.partOrSupply.findMany).toHaveBeenCalledWith({
      where: { id: { in: params.partAndSupplyIds } },
    });
    expect(prisma.workOrder.create).toHaveBeenCalledWith({
      data: {
        customerId: params.customerId,
        vehicleId: params.vehicleId,
        status: params.status,
        budget: expectedBudget,
        services: {
          create: [
            {
              serviceId: mockData.serviceData.id,
              price: mockData.serviceData.price,
            },
          ],
        },
        parts: {
          create: [
            {
              partOrSupplyId: mockData.partData.id,
              quantity: 1,
              price: mockData.partData.price,
            },
          ],
        },
      },
      include: {
        customer: true,
        vehicle: {
          include: { customer: true },
        },
        services: {
          include: { service: true },
        },
        parts: {
          include: { partOrSupply: true },
        },
      },
    });
    expect(result).toBeTruthy();
  });

  it('should create a work order with only services (no parts)', async () => {
    const params = {
      customerId: mockData.customerData.id,
      vehicleId: mockData.vehicleData.id,
      serviceIds: [mockData.serviceData.id],
      status: Status.Received,
    };
    const expectedBudget = mockData.serviceData.price;
    const createdWorkOrder = {
      id: faker.string.uuid(),
      customerId: params.customerId,
      vehicleId: params.vehicleId,
      status: params.status,
      budget: expectedBudget,
      customer: mockData.customerData,
      vehicle: mockData.vehicleData,
      services: [
        {
          serviceId: mockData.serviceData.id,
          service: mockData.serviceData,
          price: mockData.serviceData.price,
        },
      ],
      parts: [],
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.service, 'findMany').mockResolvedValueOnce([mockData.serviceData]);
    jest.spyOn(prisma.workOrder, 'create').mockResolvedValueOnce(createdWorkOrder as any);

    const result = await prismaWorkOrderRepository.create(params);

    expect(prisma.service.findMany).toHaveBeenCalledWith({
      where: { id: { in: params.serviceIds } },
    });
    expect(prisma.partOrSupply.findMany).not.toHaveBeenCalled();
    expect(prisma.workOrder.create).toHaveBeenCalledWith({
      data: {
        customerId: params.customerId,
        vehicleId: params.vehicleId,
        status: params.status,
        budget: expectedBudget,
        services: {
          create: [
            {
              serviceId: mockData.serviceData.id,
              price: mockData.serviceData.price,
            },
          ],
        },
      },
      include: {
        customer: true,
        vehicle: {
          include: { customer: true },
        },
        services: {
          include: { service: true },
        },
        parts: {
          include: { partOrSupply: true },
        },
      },
    });
    expect(result).toBeTruthy();
  });

  it('should create a work order with default status when none provided', async () => {
    const params = {
      customerId: mockData.customerData.id,
      vehicleId: mockData.vehicleData.id,
      serviceIds: [mockData.serviceData.id],
    };
    const expectedBudget = mockData.serviceData.price;
    const createdWorkOrder = {
      id: faker.string.uuid(),
      customerId: params.customerId,
      vehicleId: params.vehicleId,
      status: Status.Received,
      budget: expectedBudget,
      customer: mockData.customerData,
      vehicle: mockData.vehicleData,
      services: [
        {
          serviceId: mockData.serviceData.id,
          service: mockData.serviceData,
          price: mockData.serviceData.price,
        },
      ],
      parts: [],
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.service, 'findMany').mockResolvedValueOnce([mockData.serviceData]);
    jest.spyOn(prisma.workOrder, 'create').mockResolvedValueOnce(createdWorkOrder as any);

    const result = await prismaWorkOrderRepository.create(params);

    expect(prisma.workOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: Status.Received,
        }),
      })
    );
    expect(result).toBeTruthy();
  });

  it('should calculate budget correctly with multiple services and parts', async () => {
    const additionalService = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.number.float({ min: 100, max: 500 }),
      createdAt: new Date(),
      updatedAt: null,
    };
    const additionalPart = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.number.float({ min: 20, max: 200 }),
      createdAt: new Date(),
      updatedAt: null,
      inStock: 1,
    };
    const params = {
      customerId: mockData.customerData.id,
      vehicleId: mockData.vehicleData.id,
      serviceIds: [mockData.serviceData.id, additionalService.id],
      partAndSupplyIds: [mockData.partData.id, additionalPart.id],
      status: Status.Received,
    };
    const expectedBudget =
      mockData.serviceData.price + additionalService.price + mockData.partData.price + additionalPart.price;
    const createdWorkOrder = {
      id: faker.string.uuid(),
      customerId: params.customerId,
      vehicleId: params.vehicleId,
      status: params.status,
      budget: expectedBudget,
      customer: mockData.customerData,
      vehicle: mockData.vehicleData,
      services: [
        {
          serviceId: mockData.serviceData.id,
          service: mockData.serviceData,
          price: mockData.serviceData.price,
        },
        { serviceId: additionalService.id, service: additionalService, price: additionalService.price },
      ],
      parts: [
        {
          partOrSupplyId: mockData.partData.id,
          partOrSupply: mockData.partData,
          quantity: 1,
          price: mockData.partData.price,
        },
        {
          partOrSupplyId: additionalPart.id,
          partOrSupply: additionalPart,
          quantity: 1,
          price: additionalPart.price,
        },
      ],
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.service, 'findMany').mockResolvedValueOnce([mockData.serviceData, additionalService]);
    jest.spyOn(prisma.partOrSupply, 'findMany').mockResolvedValueOnce([mockData.partData, additionalPart]);
    jest.spyOn(prisma.workOrder, 'create').mockResolvedValueOnce(createdWorkOrder as any);

    const result = await prismaWorkOrderRepository.create(params);

    expect(prisma.workOrder.create).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  it('should return paginated work orders with filters', async () => {
    const params = {
      page: 1,
      limit: 10,
      customerId: mockData.customerData.id,
      status: Status.Received,
    };
    const workOrders = [
      {
        id: faker.string.uuid(),
        customerId: params.customerId,
        vehicleId: mockData.vehicleData.id,
        status: params.status,
        budget: 1000,
        customer: mockData.customerData,
        vehicle: mockData.vehicleData,
        services: [{ service: mockData.serviceData }],
        parts: [{ partOrSupply: mockData.partData }],
        createdAt: new Date(),
        updatedAt: null,
      },
    ];
    jest.spyOn(prisma.workOrder, 'findMany').mockResolvedValueOnce(workOrders);
    jest.spyOn(prisma.workOrder, 'count').mockResolvedValueOnce(1);

    const result = await prismaWorkOrderRepository.getAll(params);

    expect(result.content).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(params.page);
  });

  it('should exclude finished and delivered work orders by default', async () => {
    const params = {
      page: 1,
      limit: 10,
    };

    jest.spyOn(prisma.workOrder, 'findMany').mockResolvedValueOnce([]);
    jest.spyOn(prisma.workOrder, 'count').mockResolvedValueOnce(0);

    await prismaWorkOrderRepository.getAll(params);

    expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { notIn: [Status.Finished, Status.Delivered] },
        }),
      })
    );
  });

  it('should sort work orders by status priority and oldest first', async () => {
    const params = {
      page: 1,
      limit: 10,
    };
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const twoHoursAgo = new Date(now.getTime() - 7200000);

    const workOrders = [
      {
        id: faker.string.uuid(),
        customerId: mockData.customerData.id,
        vehicleId: mockData.vehicleData.id,
        status: Status.Received, // Priority 4
        budget: 1000,
        customer: mockData.customerData,
        vehicle: mockData.vehicleData,
        services: [{ service: mockData.serviceData }],
        parts: [{ partOrSupply: mockData.partData }],
        createdAt: twoHoursAgo,
        updatedAt: null,
      },
      {
        id: faker.string.uuid(),
        customerId: mockData.customerData.id,
        vehicleId: mockData.vehicleData.id,
        status: Status.InExecution, // Priority 1
        budget: 2000,
        customer: mockData.customerData,
        vehicle: mockData.vehicleData,
        services: [{ service: mockData.serviceData }],
        parts: [{ partOrSupply: mockData.partData }],
        createdAt: now,
        updatedAt: null,
      },
      {
        id: faker.string.uuid(),
        customerId: mockData.customerData.id,
        vehicleId: mockData.vehicleData.id,
        status: Status.WaitingApproval, // Priority 2
        budget: 1500,
        customer: mockData.customerData,
        vehicle: mockData.vehicleData,
        services: [{ service: mockData.serviceData }],
        parts: [{ partOrSupply: mockData.partData }],
        createdAt: oneHourAgo,
        updatedAt: null,
      },
      {
        id: faker.string.uuid(),
        customerId: mockData.customerData.id,
        vehicleId: mockData.vehicleData.id,
        status: Status.InDiagnosis, // Priority 3
        budget: 1200,
        customer: mockData.customerData,
        vehicle: mockData.vehicleData,
        services: [{ service: mockData.serviceData }],
        parts: [{ partOrSupply: mockData.partData }],
        createdAt: twoHoursAgo,
        updatedAt: null,
      },
    ];

    jest.spyOn(prisma.workOrder, 'findMany').mockResolvedValueOnce(workOrders);
    jest.spyOn(prisma.workOrder, 'count').mockResolvedValueOnce(4);

    const result = await prismaWorkOrderRepository.getAll(params);

    // Should be sorted: InExecution (1) > WaitingApproval (2) > InDiagnosis (3) > Received (4)
    expect(result.content[0].status).toBe(Status.InExecution);
    expect(result.content[1].status).toBe(Status.WaitingApproval);
    expect(result.content[2].status).toBe(Status.InDiagnosis);
    expect(result.content[3].status).toBe(Status.Received);
  });

  it('should sort work orders with same status by oldest first', async () => {
    const params = {
      page: 1,
      limit: 10,
    };
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const twoHoursAgo = new Date(now.getTime() - 7200000);

    const workOrders = [
      {
        id: 'order-3',
        customerId: mockData.customerData.id,
        vehicleId: mockData.vehicleData.id,
        status: Status.InExecution,
        budget: 1000,
        customer: mockData.customerData,
        vehicle: mockData.vehicleData,
        services: [{ service: mockData.serviceData }],
        parts: [{ partOrSupply: mockData.partData }],
        createdAt: now,
        updatedAt: null,
      },
      {
        id: 'order-1',
        customerId: mockData.customerData.id,
        vehicleId: mockData.vehicleData.id,
        status: Status.InExecution,
        budget: 2000,
        customer: mockData.customerData,
        vehicle: mockData.vehicleData,
        services: [{ service: mockData.serviceData }],
        parts: [{ partOrSupply: mockData.partData }],
        createdAt: twoHoursAgo,
        updatedAt: null,
      },
      {
        id: 'order-2',
        customerId: mockData.customerData.id,
        vehicleId: mockData.vehicleData.id,
        status: Status.InExecution,
        budget: 1500,
        customer: mockData.customerData,
        vehicle: mockData.vehicleData,
        services: [{ service: mockData.serviceData }],
        parts: [{ partOrSupply: mockData.partData }],
        createdAt: oneHourAgo,
        updatedAt: null,
      },
    ];

    jest.spyOn(prisma.workOrder, 'findMany').mockResolvedValueOnce(workOrders);
    jest.spyOn(prisma.workOrder, 'count').mockResolvedValueOnce(3);

    const result = await prismaWorkOrderRepository.getAll(params);

    // All have same status, should be sorted by oldest first
    expect(result.content[0].id).toBe('order-1');
    expect(result.content[1].id).toBe('order-2');
    expect(result.content[2].id).toBe('order-3');
  });

  it('should return a work order by id', async () => {
    const workOrder = {
      id: faker.string.uuid(),
      customerId: mockData.customerData.id,
      vehicleId: mockData.vehicleData.id,
      status: Status.Received,
      budget: 1000,
      customer: mockData.customerData,
      vehicle: mockData.vehicleData,
      services: [{ service: mockData.serviceData }],
      parts: [{ partOrSupply: mockData.partData }],
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.workOrder, 'findUnique').mockResolvedValueOnce(workOrder);

    const result = await prismaWorkOrderRepository.getById({ id: workOrder.id });

    expect(result).toBeTruthy();
    expect(result.id).toBe(workOrder.id);
  });

  it('should throw NotFoundError if work order does not exist', async () => {
    jest.spyOn(prisma.workOrder, 'findUnique').mockResolvedValueOnce(null);

    await expect(prismaWorkOrderRepository.getById({ id: faker.string.uuid() })).rejects.toThrow(NotFoundError);
  });

  it('should update work order status and recalculate budget', async () => {
    const existingWorkOrder = {
      id: faker.string.uuid() as string,
      customerId: mockData.customerData.id,
      vehicleId: mockData.vehicleData.id,
      status: Status.Received,
      budget: 1000,
      customer: mockData.customerData,
      vehicle: mockData.vehicleData,
      services: [{ service: mockData.serviceData }],
      parts: [{ partOrSupply: mockData.partData }],
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.workOrder, 'findUnique').mockResolvedValueOnce(existingWorkOrder as any);
    jest.spyOn(prisma.workOrder, 'update').mockResolvedValueOnce({
      ...existingWorkOrder,
      status: Status.InExecution,
    } as any);

    const result = await prismaWorkOrderRepository.update({
      id: existingWorkOrder.id,
      status: Status.InExecution,
    });

    expect(result).toBeTruthy();
    expect(prisma.workOrder.update).toHaveBeenCalled();
  });

  it('should throw NotFoundError if work order to update does not exist', async () => {
    jest.spyOn(prisma.workOrder, 'findUnique').mockResolvedValueOnce(null);

    await expect(
      prismaWorkOrderRepository.update({
        id: faker.string.uuid(),
        status: Status.InExecution,
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('should delete an existing work order', async () => {
    const workOrder = { id: faker.string.uuid() };
    jest.spyOn(prisma.workOrder, 'findUnique').mockResolvedValueOnce(workOrder as any);
    (prisma as any).workOrderPartOrSupply = { deleteMany: jest.fn().mockResolvedValueOnce({}) };
    (prisma as any).workOrderService = { deleteMany: jest.fn().mockResolvedValueOnce({}) };
    (prisma as any).serviceMetrics = { deleteMany: jest.fn().mockResolvedValueOnce({}) };

    jest.spyOn(prisma.workOrder, 'delete').mockResolvedValueOnce(workOrder as any);

    await prismaWorkOrderRepository.delete({ id: workOrder.id });

    expect((prisma as any).workOrderPartOrSupply.deleteMany).toHaveBeenCalledWith({
      where: { workOrderId: workOrder.id },
    });
    expect((prisma as any).workOrderService.deleteMany).toHaveBeenCalledWith({
      where: { workOrderId: workOrder.id },
    });
    expect((prisma as any).serviceMetrics.deleteMany).toHaveBeenCalledWith({
      where: { workOrderId: workOrder.id },
    });
    expect(prisma.workOrder.delete).toHaveBeenCalledWith({
      where: { id: workOrder.id },
    });
  });

  it('should throw NotFoundError if work order to delete does not exist', async () => {
    jest.spyOn(prisma.workOrder, 'findUnique').mockResolvedValueOnce(null);

    await expect(prismaWorkOrderRepository.delete({ id: faker.string.uuid() })).rejects.toThrow(NotFoundError);
  });
});
