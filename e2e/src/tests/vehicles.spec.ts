import { ApiClient, isErrorStatus } from '../helpers/api-client';
import { createTestUser } from '../helpers/auth-helper';
import { generateCustomerData, generateVehicleData } from '../helpers/test-data';

describe('Vehicles E2E Tests', () => {
  let client: ApiClient;
  let authToken: string;
  let customerId: string;

  beforeAll(async () => {
    const { tokens } = await createTestUser();
    authToken = tokens.accessToken;
    client = new ApiClient(authToken);

    const customerData = generateCustomerData('individual');
    const customerResponse = await client.post('/customers', customerData);
    customerId = customerResponse.data.id;
  });

  describe('POST /api/vehicles (Create Vehicle)', () => {
    it('should create a new vehicle with valid data', async () => {
      const vehicleData = generateVehicleData(customerId);

      const response = await client.post('/vehicles', vehicleData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.customer.id).toBe(vehicleData.customerId);
      expect(response.data.licensePlate).toBe(vehicleData.licensePlate);
      expect(response.data.brand).toBe(vehicleData.brand);
      expect(response.data.model).toBe(vehicleData.model);
      expect(response.data.year).toBe(vehicleData.year);
    });

    it('should return 400 for invalid customer ID', async () => {
      const vehicleData = generateVehicleData('invalid-id');

      try {
        await client.post('/vehicles', vehicleData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 400 for invalid year (too old)', async () => {
      const vehicleData = generateVehicleData(customerId);

      try {
        await client.post('/vehicles', {
          ...vehicleData,
          year: 1899,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 400 for invalid year (too new)', async () => {
      const vehicleData = generateVehicleData(customerId);

      try {
        await client.post('/vehicles', {
          ...vehicleData,
          year: 2031,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 401 without authentication', async () => {
      const vehicleData = generateVehicleData(customerId);
      const unauthClient = new ApiClient();

      try {
        await unauthClient.post('/vehicles', vehicleData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 401)).toBe(true);
      }
    });
  });

  describe('GET /api/vehicles (List Vehicles)', () => {
    it('should list vehicles with pagination', async () => {
      const response = await client.get('/vehicles', {
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

    it('should filter vehicles by customer ID', async () => {
      const vehicleData = generateVehicleData(customerId);
      await client.post('/vehicles', vehicleData);

      const response = await client.get('/vehicles', {
        params: { customerId },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
    });

    it('should filter vehicles by license plate', async () => {
      const vehicleData = generateVehicleData(customerId);
      await client.post('/vehicles', vehicleData);

      const response = await client.get('/vehicles', {
        params: { licensePlate: vehicleData.licensePlate },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
      expect(response.data.content[0].licensePlate).toContain(vehicleData.licensePlate);
    });

    it('should filter vehicles by brand', async () => {
      const vehicleData = generateVehicleData(customerId);
      await client.post('/vehicles', vehicleData);

      const response = await client.get('/vehicles', {
        params: { brand: vehicleData.brand },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
      expect(response.data.content[0].brand).toContain(vehicleData.brand);
    });

    it('should filter vehicles by model', async () => {
      const vehicleData = generateVehicleData(customerId);
      await client.post('/vehicles', vehicleData);

      const response = await client.get('/vehicles', {
        params: { model: vehicleData.model },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
      expect(response.data.content[0].model).toContain(vehicleData.model);
    });

    it('should filter vehicles by year', async () => {
      const vehicleData = generateVehicleData(customerId);
      await client.post('/vehicles', vehicleData);

      const response = await client.get('/vehicles', {
        params: { year: vehicleData.year },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
      response.data.content.forEach((vehicle: any) => {
        expect(vehicle.year).toBe(vehicleData.year);
      });
    });
  });

  describe('GET /api/vehicles/:id (Get Vehicle by ID)', () => {
    it('should get vehicle by valid ID', async () => {
      const vehicleData = generateVehicleData(customerId);
      const createResponse = await client.post('/vehicles', vehicleData);
      const vehicleId = createResponse.data.id;

      const response = await client.get(`/vehicles/${vehicleId}`);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(vehicleId);
      expect(response.data.licensePlate).toBe(vehicleData.licensePlate);
    });

    it('should return 404 for non-existent vehicle ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.get(`/vehicles/${fakeId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 400 for invalid UUID format', async () => {
      try {
        await client.get('/vehicles/invalid-id');
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });
  });

  describe('PATCH /api/vehicles/:id (Update Vehicle)', () => {
    it('should update vehicle brand', async () => {
      const vehicleData = generateVehicleData(customerId);
      const createResponse = await client.post('/vehicles', vehicleData);
      const vehicleId = createResponse.data.id;

      const response = await client.patch(`/vehicles/${vehicleId}`, { brand: 'Honda' });

      expect(response.status).toBe(200);
      expect(response.data.brand).toBe('Honda');
    });

    it('should update vehicle model', async () => {
      const vehicleData = generateVehicleData(customerId);
      const createResponse = await client.post('/vehicles', vehicleData);
      const vehicleId = createResponse.data.id;

      const response = await client.patch(`/vehicles/${vehicleId}`, { model: 'Civic' });

      expect(response.status).toBe(200);
      expect(response.data.model).toBe('Civic');
    });

    it('should update vehicle year', async () => {
      const vehicleData = generateVehicleData(customerId);
      const createResponse = await client.post('/vehicles', vehicleData);
      const vehicleId = createResponse.data.id;

      const response = await client.patch(`/vehicles/${vehicleId}`, { year: 2020 });

      expect(response.status).toBe(200);
      expect(response.data.year).toBe(2020);
    });

    it('should return 404 for non-existent vehicle ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.patch(`/vehicles/${fakeId}`, { brand: 'Honda' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });
  });

  describe('DELETE /api/vehicles/:id (Delete Vehicle)', () => {
    it('should delete vehicle by ID', async () => {
      const vehicleData = generateVehicleData(customerId);
      const createResponse = await client.post('/vehicles', vehicleData);
      const vehicleId = createResponse.data.id;

      const response = await client.delete(`/vehicles/${vehicleId}`);

      expect(response.status).toBe(204);

      try {
        await client.get(`/vehicles/${vehicleId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 404 for non-existent vehicle ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.delete(`/vehicles/${fakeId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });
  });
});
