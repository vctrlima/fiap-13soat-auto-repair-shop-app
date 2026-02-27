import {
  CreateCustomerRepository,
  DeleteCustomerRepository,
  GetAllCustomersRepository,
  GetCustomerByDocumentRepository,
  UpdateCustomerRepository,
} from '@/application/protocols/db';
import { CustomerRepositoryMapper } from '@/infra/db/mappers';
import { CustomerRepositoryType } from '@/infra/db/types';
import { NotFoundError } from '@/presentation/errors';
import { PrismaClient } from '@prisma/client';

type CustomerRepository = CreateCustomerRepository &
  GetAllCustomersRepository &
  GetCustomerByDocumentRepository &
  UpdateCustomerRepository &
  DeleteCustomerRepository;

export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(params: CreateCustomerRepository.Params): Promise<CreateCustomerRepository.Result> {
    const data = {
      ...params,
      phone: params.phone || null,
    };
    const saved = await this.prisma.customer.create({
      data,
      include: { vehicles: true },
    });
    return CustomerRepositoryMapper.dataToEntity(saved);
  }

  public async getAll(params: GetAllCustomersRepository.Params): Promise<GetAllCustomersRepository.Result> {
    const query = {
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { [params.orderBy || 'createdAt']: params.orderDirection || 'desc' },
      include: { vehicles: true },
    };
    const where = {};
    if (params.name) {
      Object.assign(where, { name: { contains: params.name, mode: 'insensitive' } });
    }
    if (params.email) {
      Object.assign(where, { email: { contains: params.email, mode: 'insensitive' } });
    }
    if (params.document) {
      Object.assign(where, { document: { contains: params.document } });
    }
    if (params.phone) {
      Object.assign(where, { phone: { contains: params.phone } });
    }
    Object.assign(query, { where });
    const items = this.prisma.customer.findMany(query);
    const total = this.prisma.customer.count({ where });
    return Promise.all([items, total]).then(([content, total]) => ({
      content: content.map((customer: CustomerRepositoryType) =>
        CustomerRepositoryMapper.dataToEntity(customer)
      ),
      total: total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    }));
  }

  public async getByDocument(
    params: GetCustomerByDocumentRepository.Params
  ): Promise<GetCustomerByDocumentRepository.Result> {
    const customer = await this.prisma.customer.findUnique({
      where: { document: params.document },
      include: { vehicles: true },
    });
    if (!customer) throw new NotFoundError('Customer not found');
    return CustomerRepositoryMapper.dataToEntity(customer);
  }

  public async update(params: UpdateCustomerRepository.Params): Promise<UpdateCustomerRepository.Result> {
    const existing = await this.prisma.customer.findUnique({
      where: { document: params.document },
      include: { vehicles: true },
    });
    if (!existing) throw new NotFoundError('Customer not found');
    const customer = await this.prisma.customer.update({
      where: { id: existing.id },
      data: { ...params, id: existing.id },
      include: { vehicles: true },
    });
    return CustomerRepositoryMapper.dataToEntity(customer);
  }

  public async delete(params: DeleteCustomerRepository.Params): Promise<DeleteCustomerRepository.Result> {
    const existing = await this.prisma.customer.findUnique({ where: { document: params.document } });
    if (!existing) throw new NotFoundError('Customer not found');
    await this.prisma.customer.delete({ where: { id: existing.id } });
  }
}
