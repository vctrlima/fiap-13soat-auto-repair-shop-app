import { UpdateCustomerRepository } from '@/application/protocols/db';
import { UpdateCustomer } from '@/domain/use-cases';

export class DbUpdateCustomer implements UpdateCustomer {
  constructor(private readonly updateCustomerRepository: UpdateCustomerRepository) {}

  async update(params: UpdateCustomer.Params): Promise<UpdateCustomer.Result> {
    return await this.updateCustomerRepository.update(params);
  }
}
