import { CreateCustomerRepository } from '@/application/protocols/db';
import { CreateCustomer } from '@/domain/use-cases';

export class DbCreateCustomer implements CreateCustomer {
  constructor(private readonly createCustomerRepository: CreateCustomerRepository) {}

  async create(params: CreateCustomer.Params): Promise<CreateCustomer.Result> {
    return await this.createCustomerRepository.create(params);
  }
}
