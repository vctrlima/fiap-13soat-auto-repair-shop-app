import { VehicleRepositoryType } from '@/infra/db/types';
import { VehicleRepositoryMapper } from './vehicle-repository-mapper';

describe('VehicleRepositoryMapper', () => {
  describe('dataToEntity', () => {
    it('should map data to vehicle entity correctly', () => {
      const data: VehicleRepositoryType = {
        id: '1',
        customerId: '1',
        customer: {
          id: '1',
          document: '12345678900',
          name: 'John Doe',
          phone: null,
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: null,
        },
        licensePlate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = VehicleRepositoryMapper.dataToEntity(data);

      expect(result).toEqual({
        id: data.id,
        customer: {
          id: data.customer.id,
          document: data.customer.document,
          name: data.customer.name,
          email: data.customer.email,
          phone: undefined,
          vehicles: [],
          createdAt: data.customer.createdAt,
          updatedAt: null,
        },
        licensePlate: data.licensePlate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    it('should handle missing optional fields', () => {
      const data: VehicleRepositoryType = {
        id: '1',
        customerId: '1',
        customer: {
          id: '1',
          document: '12345678900',
          name: 'John Doe',
          phone: null,
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: null,
        },
        licensePlate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        createdAt: new Date(),
        updatedAt: null,
      };

      const result = VehicleRepositoryMapper.dataToEntity(data);

      expect(result).toEqual({
        id: data.id,
        customer: {
          id: data.customer.id,
          document: data.customer.document,
          name: data.customer.name,
          email: data.customer.email,
          phone: undefined,
          vehicles: [],
          createdAt: data.customer.createdAt,
          updatedAt: null,
        },
        licensePlate: data.licensePlate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        createdAt: data.createdAt,
        updatedAt: null,
      });
    });
  });
});
