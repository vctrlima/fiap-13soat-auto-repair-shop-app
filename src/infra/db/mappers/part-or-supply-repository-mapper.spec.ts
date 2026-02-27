import { PartOrSupplyRepositoryMapper } from './part-or-supply-repository-mapper';

describe('PartOrSupplyRepositoryMapper', () => {
  describe('dataToEntity', () => {
    it('should map data to part or supply entity correctly', () => {
      const data = {
        id: '1',
        name: 'Oil Filter',
        description: 'High quality oil filter',
        price: 29.99,
        inStock: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = PartOrSupplyRepositoryMapper.dataToEntity(data);

      expect(result).toEqual({
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        inStock: data.inStock,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    it('should handle missing optional fields', () => {
      const data = {
        id: '1',
        name: 'Oil Filter',
        price: 29.99,
        inStock: 50,
        createdAt: new Date(),
      };

      const result = PartOrSupplyRepositoryMapper.dataToEntity(data);

      expect(result).toEqual({
        id: data.id,
        name: data.name,
        description: undefined,
        price: data.price,
        inStock: data.inStock,
        createdAt: data.createdAt,
        updatedAt: null,
      });
    });
  });
});
