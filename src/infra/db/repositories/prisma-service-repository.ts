import {
  CreateServiceRepository,
  DeleteServiceRepository,
  GetAllServicesRepository,
  GetServiceByIdRepository,
  UpdateServiceRepository,
} from '@/application/protocols/db';
import { ServiceRepositoryMapper } from '@/infra/db/mappers';
import { ServiceRepositoryType } from '@/infra/db/types';
import { NotFoundError } from '@/presentation/errors';
import { PrismaClient } from '@prisma/client';

type ServiceRepository = CreateServiceRepository &
  GetAllServicesRepository &
  GetServiceByIdRepository &
  UpdateServiceRepository &
  DeleteServiceRepository;

export class PrismaServiceRepository implements ServiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(params: CreateServiceRepository.Params): Promise<CreateServiceRepository.Result> {
    const data = {
      ...params,
      description: params.description || null,
    };
    const saved = await this.prisma.service.create({ data });
    return ServiceRepositoryMapper.dataToEntity(saved);
  }

  public async getAll(params: GetAllServicesRepository.Params): Promise<GetAllServicesRepository.Result> {
    const query = {
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { [params.orderBy || 'createdAt']: params.orderDirection || 'desc' },
    };
    const where = {};
    if (params.name) {
      Object.assign(where, { name: { contains: params.name, mode: 'insensitive' } });
    }
    Object.assign(query, { where });
    const items = this.prisma.service.findMany(query);
    const total = this.prisma.service.count({ where });
    return Promise.all([items, total]).then(([content, total]) => ({
      content: content.map((item: ServiceRepositoryType) => ServiceRepositoryMapper.dataToEntity(item)),
      total: total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    }));
  }

  public async getById(params: GetServiceByIdRepository.Params): Promise<GetServiceByIdRepository.Result> {
    const item = await this.prisma.service.findUnique({ where: { id: params.id } });
    if (!item) throw new NotFoundError('Service not found');
    return ServiceRepositoryMapper.dataToEntity(item);
  }

  public async update(params: UpdateServiceRepository.Params): Promise<UpdateServiceRepository.Result> {
    const existing = await this.getById({ id: params.id });
    const data = { ...existing, ...params, id: existing.id };
    const updated = await this.prisma.service.update({
      where: { id: existing.id },
      data,
    });
    return ServiceRepositoryMapper.dataToEntity(updated);
  }

  public async delete(params: DeleteServiceRepository.Params): Promise<DeleteServiceRepository.Result> {
    const existing = await this.prisma.service.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError('Service not found');
    await this.prisma.service.delete({ where: { id: existing.id } });
  }
}
