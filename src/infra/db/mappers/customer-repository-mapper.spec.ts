import { CustomerRepositoryType } from '@/infra/db/types';
import { CustomerRepositoryMapper } from './customer-repository-mapper';

describe('CustomerRepositoryMapper', () => {
  describe('dataToEntity', () => {
    it('should map data to customer entity correctly', () => {
      const data = {
        id: '1',
        document: '12345678900',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = CustomerRepositoryMapper.dataToEntity(data);

      expect(result).toEqual({
        id: data.id,
        document: data.document,
        name: data.name,
        email: data.email,
        phone: data.phone,
        vehicles: [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    it('should handle missing optional fields', () => {
      const data: CustomerRepositoryType = {
        id: '1',
        document: '12345678900',
        name: 'John Doe',
        phone: null,
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: null,
      };

      const result = CustomerRepositoryMapper.dataToEntity(data);

      expect(result).toEqual({
        id: data.id,
        document: data.document,
        name: data.name,
        email: data.email,
        phone: undefined,
        vehicles: [],
        createdAt: data.createdAt,
        updatedAt: null,
      });
    });
  });
});
