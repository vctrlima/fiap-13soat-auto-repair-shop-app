import { GetAllCustomersRepository } from '@/application/protocols/db';
import { GetAllCustomers } from '@/domain/use-cases';

export class DbGetAllCustomers implements GetAllCustomers {
  constructor(private readonly getAllCustomersRepository: GetAllCustomersRepository) {}

  async getAll(params: GetAllCustomers.Params) {
    return await this.getAllCustomersRepository.getAll(params);
  }
}
