import { ServiceRepositoryMapper } from './service-repository-mapper';

describe('ServiceRepositoryMapper', () => {
  describe('dataToEntity', () => {
    it('should map data to service entity correctly', () => {
      const data = {
        id: '1',
        name: 'Oil Change',
        description: 'Complete oil change service',
        price: 79.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = ServiceRepositoryMapper.dataToEntity(data);

      expect(result).toEqual({
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    it('should handle missing optional fields', () => {
      const data = {
        id: '1',
        name: 'Oil Change',
        price: 79.99,
        createdAt: new Date(),
      };

      const result = ServiceRepositoryMapper.dataToEntity(data);

      expect(result).toEqual({
        id: data.id,
        name: data.name,
        description: undefined,
        price: data.price,
        createdAt: data.createdAt,
        updatedAt: undefined,
      });
    });
  });
});
