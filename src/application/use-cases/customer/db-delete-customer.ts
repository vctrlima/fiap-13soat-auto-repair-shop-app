import { DeleteCustomerRepository } from '@/application/protocols/db';
import { DeleteCustomer } from '@/domain/use-cases';

export class DbDeleteCustomer implements DeleteCustomer {
  constructor(private readonly deleteCustomerRepository: DeleteCustomerRepository) {}

  async delete(params: DeleteCustomer.Params): Promise<DeleteCustomer.Result> {
    return await this.deleteCustomerRepository.delete(params);
  }
}
