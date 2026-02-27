import {
  CreateWorkOrderRepository,
  DeleteWorkOrderRepository,
  GetAllWorkOrdersRepository,
  GetWorkOrderByIdRepository,
  UpdateWorkOrderRepository,
} from '@/application/protocols/db';
import { Status } from '@/domain/enums';
import { WorkOrderRepositoryMapper } from '@/infra/db/mappers';
import { PartOrSupplyRepositoryType, ServiceRepositoryType, WorkOrderRepositoryType } from '@/infra/db/types';
import { NotFoundError } from '@/presentation/errors';
import { PrismaClient } from '@prisma/client';

type WorkOrderRepository = CreateWorkOrderRepository &
  GetAllWorkOrdersRepository &
  GetWorkOrderByIdRepository &
  UpdateWorkOrderRepository &
  DeleteWorkOrderRepository;

export class PrismaWorkOrderRepository implements WorkOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(params: CreateWorkOrderRepository.Params): Promise<CreateWorkOrderRepository.Result> {
    const services = params.serviceIds
      ? await this.prisma.service.findMany({
          where: { id: { in: params.serviceIds } },
        })
      : [];
    const parts = params.partAndSupplyIds
      ? await this.prisma.partOrSupply.findMany({ where: { id: { in: params.partAndSupplyIds } } })
      : [];
    const result = await this.prisma.workOrder.create({
      data: {
        customerId: params.customerId,
        vehicleId: params.vehicleId,
        status: params.status || Status.Received,
        budget: this.calculateBudget(services, parts),
        ...(params.serviceIds && {
          services: {
            create: services.map((service: ServiceRepositoryType) => ({
              serviceId: service.id,
              price: service.price,
            })),
          },
        }),
        ...(params.partAndSupplyIds && {
          parts: {
            create: parts.map((part: PartOrSupplyRepositoryType) => ({
              partOrSupplyId: part.id,
              quantity: 1,
              price: part.price,
            })),
          },
        }),
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

    return WorkOrderRepositoryMapper.dataToEntity(result);
  }

  private calculateBudget(services: Array<{ price: number }>, parts: Array<{ price: number }>) {
    const servicesTotal = services.reduce((sum, service) => sum + service.price, 0);
    const partsTotal = parts.reduce((sum, part) => sum + part.price, 0);
    return servicesTotal + partsTotal;
  }

  private readonly statusPriority: Record<string, number> = {
    [Status.InExecution]: 1,
    [Status.WaitingApproval]: 2,
    [Status.InDiagnosis]: 3,
    [Status.Received]: 4,
    [Status.Approved]: 5,
    [Status.Canceled]: 6,
  };

  private readonly excludedStatuses = [Status.Finished, Status.Delivered];

  public async getAll(params: GetAllWorkOrdersRepository.Params): Promise<GetAllWorkOrdersRepository.Result> {
    const query = {
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: 'asc' as const },
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
    };

    const where: Record<string, unknown> = {
      status: { notIn: this.excludedStatuses },
    };

    if (params.customerId) Object.assign(where, { customerId: params.customerId });
    if (params.vehicleId) Object.assign(where, { vehicleId: params.vehicleId });
    if (params.status) {
      Object.assign(where, { status: params.status });
    }
    if (params.minBudget !== undefined || params.maxBudget !== undefined) {
      Object.assign(where, {
        budget: {
          ...(params.minBudget !== undefined && { gte: params.minBudget }),
          ...(params.maxBudget !== undefined && { lte: params.maxBudget }),
        },
      });
    }
    Object.assign(query, { where });
    const items = this.prisma.workOrder.findMany(query);
    const total = this.prisma.workOrder.count({ where });
    return Promise.all([items, total]).then(([content, total]) => {
      const sortedContent = content.sort((a: WorkOrderRepositoryType, b: WorkOrderRepositoryType) => {
        const priorityA = this.statusPriority[a.status] ?? 99;
        const priorityB = this.statusPriority[b.status] ?? 99;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      return {
        content: sortedContent.map((item: WorkOrderRepositoryType) =>
          WorkOrderRepositoryMapper.dataToEntity(item)
        ),
        total: total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      };
    });
  }

  public async getById(params: GetWorkOrderByIdRepository.Params): Promise<GetWorkOrderByIdRepository.Result> {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: params.id },
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
    if (!workOrder) throw new NotFoundError('Work order not found');
    return WorkOrderRepositoryMapper.dataToEntity(workOrder);
  }

  public async update(params: UpdateWorkOrderRepository.Params): Promise<UpdateWorkOrderRepository.Result> {
    const existing = await this.prisma.workOrder.findUnique({
      where: { id: params.id },
      include: {
        services: { include: { service: true } },
        parts: { include: { partOrSupply: true } },
        customer: { include: { vehicles: false, workOrders: false } },
      },
    });
    if (!existing) throw new NotFoundError('Work order not found');

    if (params.serviceIds !== undefined) {
      await this.prisma.workOrderService.deleteMany({ where: { workOrderId: params.id } });
    }
    if (params.partAndSupplyIds !== undefined) {
      await this.prisma.workOrderPartOrSupply.deleteMany({ where: { workOrderId: params.id } });
    }

    const services = params.serviceIds
      ? await this.prisma.service.findMany({ where: { id: { in: params.serviceIds } } })
      : existing.services.map((ws: { service: ServiceRepositoryType }) => ws.service);
    const parts = params.partAndSupplyIds
      ? await this.prisma.partOrSupply.findMany({ where: { id: { in: params.partAndSupplyIds } } })
      : existing.parts.map((item: { partOrSupply: PartOrSupplyRepositoryType }) => item.partOrSupply);

    const newBudget = this.calculateBudget(services, parts);
    const updatedWorkOrder = await this.prisma.workOrder.update({
      where: { id: params.id },
      data: {
        status: params.status,
        budget: newBudget,
        ...(params.serviceIds && {
          services: {
            create: services.map((service: ServiceRepositoryType) => ({
              serviceId: service.id,
              price: service.price,
            })),
          },
        }),
        ...(params.partAndSupplyIds && {
          parts: {
            create: parts.map((part: PartOrSupplyRepositoryType) => ({
              partOrSupplyId: part.id,
              quantity: 1,
              price: part.price,
            })),
          },
        }),
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

    return WorkOrderRepositoryMapper.dataToEntity(updatedWorkOrder);
  }

  public async delete(params: DeleteWorkOrderRepository.Params): Promise<DeleteWorkOrderRepository.Result> {
    const existing = await this.prisma.workOrder.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError('Work order not found');
    await this.prisma.workOrderPartOrSupply.deleteMany({ where: { workOrderId: existing.id } });
    await this.prisma.workOrderService.deleteMany({ where: { workOrderId: existing.id } });
    await this.prisma.serviceMetrics.deleteMany({ where: { workOrderId: existing.id } });
    await this.prisma.workOrder.delete({ where: { id: existing.id } });
  }
}
