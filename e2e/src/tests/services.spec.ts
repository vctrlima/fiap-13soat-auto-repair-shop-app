import { ApiClient, isErrorStatus } from '../helpers/api-client';
import { createTestUser } from '../helpers/auth-helper';
import { generateServiceData } from '../helpers/test-data';

describe('Services E2E Tests', () => {
  let client: ApiClient;
  let authToken: string;

  beforeAll(async () => {
    const { tokens } = await createTestUser();
    authToken = tokens.accessToken;
    client = new ApiClient(authToken);
  });

  describe('POST /api/services (Create Service)', () => {
    it('should create a new service with valid data', async () => {
      const serviceData = generateServiceData();

      const response = await client.post('/services', serviceData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe(serviceData.name);
      expect(response.data.description).toBe(serviceData.description);
      expect(response.data.price).toBe(serviceData.price);
    });

    it('should create a service without description', async () => {
      const serviceData = generateServiceData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { description: _description, ...dataWithoutDescription } = serviceData;

      const response = await client.post('/services', dataWithoutDescription);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe(serviceData.name);
    });

    it('should return 400 for negative price', async () => {
      const serviceData = generateServiceData();

      try {
        await client.post('/services', {
          ...serviceData,
          price: -10,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 400 for missing name', async () => {
      const serviceData = generateServiceData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name: _name, ...dataWithoutName } = serviceData;

      try {
        await client.post('/services', dataWithoutName);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 400 for missing price', async () => {
      const serviceData = generateServiceData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { price: _price, ...dataWithoutPrice } = serviceData;

      try {
        await client.post('/services', dataWithoutPrice);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 401 without authentication', async () => {
      const serviceData = generateServiceData();
      const unauthClient = new ApiClient();

      try {
        await unauthClient.post('/services', serviceData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 401)).toBe(true);
      }
    });
  });

  describe('GET /api/services (List Services)', () => {
    it('should list services with pagination', async () => {
      const response = await client.get('/services', {
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

    it('should filter services by name', async () => {
      const serviceData = generateServiceData();
      await client.post('/services', serviceData);

      const response = await client.get('/services', {
        params: { name: serviceData.name },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
      expect(response.data.content[0].name).toContain(serviceData.name);
    });

    it('should sort services by name ascending', async () => {
      const response = await client.get('/services', {
        params: { orderBy: 'name', orderDirection: 'asc' },
      });

      expect(response.status).toBe(200);
      const names = response.data.content.map((service: any) => service.name);
      expect(names).toEqual([...names].sort());
    });

    it('should sort services by createdAt descending', async () => {
      const response = await client.get('/services', {
        params: { orderBy: 'createdAt', orderDirection: 'desc' },
      });

      expect(response.status).toBe(200);
      const dates = response.data.content.map((service: any) => new Date(service.createdAt).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });
  });

  describe('GET /api/services/:id (Get Service by ID)', () => {
    it('should get service by valid ID', async () => {
      const serviceData = generateServiceData();
      const createResponse = await client.post('/services', serviceData);
      const serviceId = createResponse.data.id;

      const response = await client.get(`/services/${serviceId}`);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(serviceId);
      expect(response.data.name).toBe(serviceData.name);
    });

    it('should return 404 for non-existent service ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.get(`/services/${fakeId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 400 for invalid UUID format', async () => {
      try {
        await client.get('/services/invalid-id');
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });
  });

  describe('PATCH /api/services/:id (Update Service)', () => {
    it('should update service name', async () => {
      const serviceData = generateServiceData();
      const createResponse = await client.post('/services', serviceData);
      const serviceId = createResponse.data.id;

      const newName = `Updated ${serviceData.name}`;
      const response = await client.patch(`/services/${serviceId}`, { name: newName });

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(serviceId);
      expect(response.data.name).toBe(newName);
    });

    it('should update service description', async () => {
      const serviceData = generateServiceData();
      const createResponse = await client.post('/services', serviceData);
      const serviceId = createResponse.data.id;

      const newDescription = 'Updated description';
      const response = await client.patch(`/services/${serviceId}`, {
        description: newDescription,
      });

      expect(response.status).toBe(200);
      expect(response.data.description).toBe(newDescription);
    });

    it('should update service price', async () => {
      const serviceData = generateServiceData();
      const createResponse = await client.post('/services', serviceData);
      const serviceId = createResponse.data.id;

      const newPrice = 250.5;
      const response = await client.patch(`/services/${serviceId}`, { price: newPrice });

      expect(response.status).toBe(200);
      expect(response.data.price).toBe(newPrice);
    });

    it('should return 404 for non-existent service ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.patch(`/services/${fakeId}`, { name: 'Updated Name' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 400 for negative price', async () => {
      const serviceData = generateServiceData();
      const createResponse = await client.post('/services', serviceData);
      const serviceId = createResponse.data.id;

      try {
        await client.patch(`/services/${serviceId}`, { price: -10 });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });
  });

  describe('DELETE /api/services/:id (Delete Service)', () => {
    it('should delete service by ID', async () => {
      const serviceData = generateServiceData();
      const createResponse = await client.post('/services', serviceData);
      const serviceId = createResponse.data.id;

      const response = await client.delete(`/services/${serviceId}`);

      expect(response.status).toBe(204);

      try {
        await client.get(`/services/${serviceId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 404 for non-existent service ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.delete(`/services/${fakeId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });
  });
});
