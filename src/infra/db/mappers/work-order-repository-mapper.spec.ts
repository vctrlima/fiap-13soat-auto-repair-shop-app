import { Status } from '@/domain/enums';
import { WorkOrderRepositoryType } from '@/infra/db/types';
import { WorkOrderRepositoryMapper } from './work-order-repository-mapper';

describe('WorkOrderRepositoryMapper', () => {
  describe('dataToEntity', () => {
    it('should map data to work order entity correctly', () => {
      const data: WorkOrderRepositoryType = {
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
          vehicles: [],
        },
        vehicleId: '1',
        vehicle: {
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
        },
        services: [
          {
            id: '1',
            name: 'Oil Change',
            description: 'Complete oil change service',
            price: 79.99,
            createdAt: new Date(),
          },
        ],
        parts: [
          {
            id: '1',
            name: 'Oil Filter',
            description: 'High quality oil filter',
            price: 29.99,
            inStock: 50,
            createdAt: new Date(),
          },
        ],
        status: Status.InExecution,
        budget: 109.98,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = WorkOrderRepositoryMapper.dataToEntity(data);

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
        vehicle: {
          id: data.vehicle.id,
          customer: {
            id: data.vehicle.customer.id,
            document: data.vehicle.customer.document,
            name: data.vehicle.customer.name,
            email: data.vehicle.customer.email,
            phone: undefined,
            vehicles: [],
            createdAt: data.vehicle.customer.createdAt,
            updatedAt: null,
          },
          licensePlate: data.vehicle.licensePlate,
          brand: data.vehicle.brand,
          model: data.vehicle.model,
          year: data.vehicle.year,
          createdAt: data.vehicle.createdAt,
          updatedAt: null,
        },
        services: [
          {
            id: data.services[0].id,
            name: data.services[0].name,
            description: data.services[0].description,
            price: data.services[0].price,
            createdAt: data.services[0].createdAt,
            updatedAt: undefined,
          },
        ],
        partsAndSupplies: [
          {
            id: data.parts[0].id,
            name: data.parts[0].name,
            description: data.parts[0].description,
            price: data.parts[0].price,
            inStock: data.parts[0].inStock,
            createdAt: data.parts[0].createdAt,
            updatedAt: null,
          },
        ],
        status: data.status,
        budget: data.budget,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    it('should handle missing optional fields and empty arrays', () => {
      const data: WorkOrderRepositoryType = {
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
          vehicles: [],
        },
        vehicleId: '1',
        vehicle: {
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
        },
        services: [],
        parts: [],
        status: Status.InExecution,
        budget: 0,
        createdAt: new Date(),
        updatedAt: null,
      };

      const result = WorkOrderRepositoryMapper.dataToEntity(data);

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
        vehicle: {
          id: data.vehicle.id,
          customer: {
            id: data.vehicle.customer.id,
            document: data.vehicle.customer.document,
            name: data.vehicle.customer.name,
            email: data.vehicle.customer.email,
            phone: undefined,
            vehicles: [],
            createdAt: data.vehicle.customer.createdAt,
            updatedAt: null,
          },
          licensePlate: data.vehicle.licensePlate,
          brand: data.vehicle.brand,
          model: data.vehicle.model,
          year: data.vehicle.year,
          createdAt: data.vehicle.createdAt,
          updatedAt: null,
        },
        services: [],
        partsAndSupplies: [],
        status: data.status,
        budget: data.budget,
        createdAt: data.createdAt,
        updatedAt: null,
      });
    });
  });
});
