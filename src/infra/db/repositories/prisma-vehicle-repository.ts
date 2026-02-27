import {
  CreateVehicleRepository,
  DeleteVehicleRepository,
  GetAllVehiclesRepository,
  GetVehicleByIdRepository,
  UpdateVehicleRepository,
} from '@/application/protocols/db';
import { NotFoundError } from '@/presentation/errors';
import { PrismaClient } from '@prisma/client';
import { VehicleRepositoryType } from '../types';

export class PrismaVehicleRepository
  implements
    CreateVehicleRepository,
    GetAllVehiclesRepository,
    GetVehicleByIdRepository,
    UpdateVehicleRepository,
    DeleteVehicleRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(params: CreateVehicleRepository.Params): Promise<CreateVehicleRepository.Result> {
    const { customerId, licensePlate, brand, model, year } = params;
    const vehicle = await this.prisma.vehicle.create({
      data: {
        customerId,
        licensePlate,
        brand,
        model,
        year,
      },
      include: { customer: true },
    });
    return {
      id: vehicle.id,
      customer: {
        ...vehicle.customer,
        vehicles: [],
        phone: vehicle.customer.phone ?? undefined,
      },
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }

  async getAll(params: GetAllVehiclesRepository.Params): Promise<GetAllVehiclesRepository.Result> {
    const { page = 1, limit = 10, licensePlate, brand, model, year } = params;
    const where = {
      ...(licensePlate && { licensePlate: { contains: licensePlate } }),
      ...(brand && { brand: { contains: brand, mode: 'insensitive' as const } }),
      ...(model && { model: { contains: model, mode: 'insensitive' as const } }),
      ...(year && { year }),
    };
    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
        where,
      }),
      this.prisma.vehicle.count({ where }),
    ]);
    return {
      content: vehicles.map((vehicle: VehicleRepositoryType) => ({
        id: vehicle.id,
        customer: {
          ...vehicle.customer,
          vehicles: [],
          phone: vehicle.customer.phone ?? undefined,
        },
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(params: GetVehicleByIdRepository.Params): Promise<GetVehicleByIdRepository.Result> {
    const { id } = params;
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    return {
      id: vehicle.id,
      customer: {
        ...vehicle.customer,
        vehicles: [],
        phone: vehicle.customer.phone ?? undefined,
      },
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }

  async update(params: UpdateVehicleRepository.Params): Promise<UpdateVehicleRepository.Result> {
    const { id, brand, model, year } = params;
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        brand,
        model,
        year,
      },
      include: { customer: true },
    });
    return {
      id: updatedVehicle.id,
      customer: {
        ...updatedVehicle.customer,
        vehicles: [],
        phone: updatedVehicle.customer.phone ?? undefined,
      },
      licensePlate: updatedVehicle.licensePlate,
      brand: updatedVehicle.brand,
      model: updatedVehicle.model,
      year: updatedVehicle.year,
      createdAt: updatedVehicle.createdAt,
      updatedAt: updatedVehicle.updatedAt,
    };
  }

  async delete(params: DeleteVehicleRepository.Params): Promise<void> {
    const { id } = params;
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    await this.prisma.vehicle.delete({ where: { id } });
  }
}
