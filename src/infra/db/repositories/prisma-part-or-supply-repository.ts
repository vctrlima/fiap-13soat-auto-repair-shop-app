import {
  CreatePartOrSupplyRepository,
  DeletePartOrSupplyRepository,
  GetAllPartsOrSuppliesRepository,
  GetPartOrSupplyByIdRepository,
  UpdatePartOrSupplyRepository,
} from '@/application/protocols/db';
import { PartOrSupplyRepositoryMapper } from '@/infra/db/mappers';
import { PartOrSupplyRepositoryType } from '@/infra/db/types';
import { NotFoundError } from '@/presentation/errors';
import { PrismaClient } from '@prisma/client';

type PartOrSupplyRepository = CreatePartOrSupplyRepository &
  GetAllPartsOrSuppliesRepository &
  GetPartOrSupplyByIdRepository &
  UpdatePartOrSupplyRepository &
  DeletePartOrSupplyRepository;

export class PrismaPartOrSupplyRepository implements PartOrSupplyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(
    params: CreatePartOrSupplyRepository.Params
  ): Promise<CreatePartOrSupplyRepository.Result> {
    const data = {
      ...params,
      description: params.description || null,
    };
    const saved = await this.prisma.partOrSupply.create({ data });
    return PartOrSupplyRepositoryMapper.dataToEntity(saved);
  }

  public async getAll(
    params: GetAllPartsOrSuppliesRepository.Params
  ): Promise<GetAllPartsOrSuppliesRepository.Result> {
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
    const items = this.prisma.partOrSupply.findMany(query);
    const total = this.prisma.partOrSupply.count({ where });
    return Promise.all([items, total]).then(([content, total]) => ({
      content: content.map((item: PartOrSupplyRepositoryType) =>
        PartOrSupplyRepositoryMapper.dataToEntity(item)
      ),
      total: total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    }));
  }

  public async getById(
    params: GetPartOrSupplyByIdRepository.Params
  ): Promise<GetPartOrSupplyByIdRepository.Result> {
    const item = await this.prisma.partOrSupply.findUnique({ where: { id: params.id } });
    if (!item) throw new NotFoundError('Part or supply not found');
    return PartOrSupplyRepositoryMapper.dataToEntity(item);
  }

  public async update(
    params: UpdatePartOrSupplyRepository.Params
  ): Promise<UpdatePartOrSupplyRepository.Result> {
    const existing = await this.getById({ id: params.id });
    const data = {
      ...existing,
      ...params,
      id: existing.id,
    };
    const updated = await this.prisma.partOrSupply.update({
      where: { id: existing.id },
      data,
    });
    return PartOrSupplyRepositoryMapper.dataToEntity(updated);
  }

  public async delete(
    params: DeletePartOrSupplyRepository.Params
  ): Promise<DeletePartOrSupplyRepository.Result> {
    const existing = await this.prisma.partOrSupply.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError('Part or supply not found');
    await this.prisma.partOrSupply.delete({ where: { id: existing.id } });
  }
}
