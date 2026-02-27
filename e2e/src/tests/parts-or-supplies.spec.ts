import { ApiClient, isErrorStatus } from '../helpers/api-client';
import { createTestUser } from '../helpers/auth-helper';
import { generatePartData } from '../helpers/test-data';

describe('Parts and Supplies E2E Tests', () => {
  let client: ApiClient;
  let authToken: string;

  beforeAll(async () => {
    const { tokens } = await createTestUser();
    authToken = tokens.accessToken;
    client = new ApiClient(authToken);
  });

  describe('POST /api/parts-or-supplies (Create Part or Supply)', () => {
    it('should create a new part/supply with valid data', async () => {
      const partData = generatePartData();

      const response = await client.post('/parts-or-supplies', partData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe(partData.name);
      expect(response.data.description).toBe(partData.description);
      expect(response.data.price).toBe(partData.price);
      expect(response.data.inStock).toBe(partData.inStock);
    });

    it('should create a part/supply without description', async () => {
      const partData = generatePartData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { description: _description, ...dataWithoutDescription } = partData;

      const response = await client.post('/parts-or-supplies', dataWithoutDescription);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe(partData.name);
    });

    it('should return 400 for negative price', async () => {
      const partData = generatePartData();

      try {
        await client.post('/parts-or-supplies', {
          ...partData,
          price: -10,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 400 for negative stock', async () => {
      const partData = generatePartData();

      try {
        await client.post('/parts-or-supplies', {
          ...partData,
          inStock: -5,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 400 for missing name', async () => {
      const partData = generatePartData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name: _name, ...dataWithoutName } = partData;

      try {
        await client.post('/parts-or-supplies', dataWithoutName);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 401 without authentication', async () => {
      const partData = generatePartData();
      const unauthClient = new ApiClient();

      try {
        await unauthClient.post('/parts-or-supplies', partData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 401)).toBe(true);
      }
    });
  });

  describe('GET /api/parts-or-supplies (List Parts and Supplies)', () => {
    it('should list parts/supplies with pagination', async () => {
      const response = await client.get('/parts-or-supplies', {
        params: { page: 1, limit: 10 },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('page');
      expect(response.data).toHaveProperty('limit');
      expect(response.data).toHaveProperty('total');
      expect(response.data).toHaveProperty('totalPages');
      expect(response.data).toHaveProperty('content');
      expect(Array.isArray(response.data.content)).toBe(true);
    });

    it('should filter parts/supplies by name', async () => {
      const partData = generatePartData();
      await client.post('/parts-or-supplies', partData);

      const response = await client.get('/parts-or-supplies', {
        params: { name: partData.name },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
      expect(response.data.content[0].name).toContain(partData.name);
    });

    it('should filter parts/supplies by in stock status (true)', async () => {
      const partData = generatePartData();
      await client.post('/parts-or-supplies', { ...partData, inStock: 10 });

      const response = await client.get('/parts-or-supplies', {
        params: { inStock: true },
      });

      expect(response.status).toBe(200);
      response.data.content.forEach((part: any) => {
        expect(part.inStock).toBeGreaterThanOrEqual(0);
      });
    });

    it('should filter parts/supplies by in stock status (false)', async () => {
      const partData = generatePartData();
      await client.post('/parts-or-supplies', { ...partData, inStock: 0 });

      const response = await client.get('/parts-or-supplies', {
        params: { inStock: false },
      });

      expect(response.status).toBe(200);
      response.data.content.forEach((part: any) => {
        expect(part.inStock).toBeGreaterThanOrEqual(0);
      });
    });

    it('should sort parts/supplies by name ascending', async () => {
      const response = await client.get('/parts-or-supplies', {
        params: { orderBy: 'name', orderDirection: 'asc' },
      });

      expect(response.status).toBe(200);
      const names = response.data.content.map((part: any) => part.name);
      expect(names).toEqual([...names].sort());
    });
  });

  describe('GET /api/parts-or-supplies/:id (Get Part or Supply by ID)', () => {
    it('should get part/supply by valid ID', async () => {
      const partData = generatePartData();
      const createResponse = await client.post('/parts-or-supplies', partData);
      const partId = createResponse.data.id;

      const response = await client.get(`/parts-or-supplies/${partId}`);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(partId);
      expect(response.data.name).toBe(partData.name);
    });

    it('should return 404 for non-existent part/supply ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.get(`/parts-or-supplies/${fakeId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 400 for invalid UUID format', async () => {
      try {
        await client.get('/parts-or-supplies/invalid-id');
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });
  });

  describe('PATCH /api/parts-or-supplies/:id (Update Part or Supply)', () => {
    it('should update part/supply name', async () => {
      const partData = generatePartData();
      const createResponse = await client.post('/parts-or-supplies', partData);
      const partId = createResponse.data.id;

      const newName = `Updated ${partData.name}`;
      const response = await client.patch(`/parts-or-supplies/${partId}`, { name: newName });

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(partId);
      expect(response.data.name).toBe(newName);
    });

    it('should update part/supply description', async () => {
      const partData = generatePartData();
      const createResponse = await client.post('/parts-or-supplies', partData);
      const partId = createResponse.data.id;

      const newDescription = 'Updated description';
      const response = await client.patch(`/parts-or-supplies/${partId}`, {
        description: newDescription,
      });

      expect(response.status).toBe(200);
      expect(response.data.description).toBe(newDescription);
    });

    it('should update part/supply price', async () => {
      const partData = generatePartData();
      const createResponse = await client.post('/parts-or-supplies', partData);
      const partId = createResponse.data.id;

      const newPrice = 99.99;
      const response = await client.patch(`/parts-or-supplies/${partId}`, { price: newPrice });

      expect(response.status).toBe(200);
      expect(response.data.price).toBe(newPrice);
    });

    it('should update part/supply stock', async () => {
      const partData = generatePartData();
      const createResponse = await client.post('/parts-or-supplies', partData);
      const partId = createResponse.data.id;

      const newStock = 50;
      const response = await client.patch(`/parts-or-supplies/${partId}`, { inStock: newStock });

      expect(response.status).toBe(200);
      expect(response.data.inStock).toBe(newStock);
    });

    it('should return 404 for non-existent part/supply ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.patch(`/parts-or-supplies/${fakeId}`, { name: 'Updated Name' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 400 for negative price', async () => {
      const partData = generatePartData();
      const createResponse = await client.post('/parts-or-supplies', partData);
      const partId = createResponse.data.id;

      try {
        await client.patch(`/parts-or-supplies/${partId}`, { price: -10 });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });
  });

  describe('DELETE /api/parts-or-supplies/:id (Delete Part or Supply)', () => {
    it('should delete part/supply by ID', async () => {
      const partData = generatePartData();
      const createResponse = await client.post('/parts-or-supplies', partData);
      const partId = createResponse.data.id;

      const response = await client.delete(`/parts-or-supplies/${partId}`);

      expect(response.status).toBe(204);

      try {
        await client.get(`/parts-or-supplies/${partId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 404 for non-existent part/supply ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.delete(`/parts-or-supplies/${fakeId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });
  });
});
