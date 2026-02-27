import { ApiClient, isErrorStatus } from '../helpers/api-client';
import { createTestUser } from '../helpers/auth-helper';
import {
  generateCustomerData,
  generatePartData,
  generateServiceData,
  generateVehicleData,
  generateWorkOrderData,
} from '../helpers/test-data';

describe('Work Orders E2E Tests', () => {
  let client: ApiClient;
  let authToken: string;
  let customerId: string;
  let vehicleId: string;
  let serviceId: string;
  let partId: string;

  beforeAll(async () => {
    const { tokens } = await createTestUser();
    authToken = tokens.accessToken;
    client = new ApiClient(authToken);

    const customerData = generateCustomerData('individual');
    const customerResponse = await client.post('/customers', customerData);
    customerId = customerResponse.data.id;

    const vehicleData = generateVehicleData(customerId);
    const vehicleResponse = await client.post('/vehicles', vehicleData);
    vehicleId = vehicleResponse.data.id;

    const serviceData = generateServiceData();
    const serviceResponse = await client.post('/services', serviceData);
    serviceId = serviceResponse.data.id;

    const partData = generatePartData();
    const partResponse = await client.post('/parts-or-supplies', partData);
    partId = partResponse.data.id;
  });

  describe('POST /api/work-orders (Create Work Order)', () => {
    it('should create a new work order with services and parts', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [serviceId], [partId], 'RECEIVED');

      const response = await client.post('/work-orders', workOrderData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.customer.id).toBe(customerId);
      expect(response.data.vehicle.id).toBe(vehicleId);
      expect(response.data.status).toBe('RECEIVED');
      expect(response.data).toHaveProperty('budget');
    });

    it('should create a work order without parts', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [serviceId], [], 'RECEIVED');

      const response = await client.post('/work-orders', workOrderData);

      expect(response.status).toBe(201);
      expect(response.data.partAndSupplyIds).toBeFalsy();
    });

    it('should create a work order without services', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [], [partId], 'RECEIVED');

      const response = await client.post('/work-orders', workOrderData);

      expect(response.status).toBe(201);
      expect(response.data.serviceIds).toBeFalsy();
    });

    it('should create a work order with IN_DIAGNOSIS status', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [serviceId], [], 'IN_DIAGNOSIS');

      const response = await client.post('/work-orders', workOrderData);

      expect(response.status).toBe(201);
      expect(response.data.status).toBe('IN_DIAGNOSIS');
    });

    it('should return 400 for invalid customer ID', async () => {
      const workOrderData = generateWorkOrderData('invalid-id', vehicleId, [serviceId], [], 'RECEIVED');

      try {
        await client.post('/work-orders', workOrderData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 400 for invalid vehicle ID', async () => {
      const workOrderData = generateWorkOrderData(customerId, 'invalid-id', [serviceId], [], 'RECEIVED');

      try {
        await client.post('/work-orders', workOrderData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 401 without authentication', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [serviceId], [], 'RECEIVED');
      const unauthClient = new ApiClient();

      try {
        await unauthClient.post('/work-orders', workOrderData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 401)).toBe(true);
      }
    });
  });

  describe('GET /api/work-orders (List Work Orders)', () => {
    it('should list work orders with pagination', async () => {
      const response = await client.get('/work-orders', {
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

    it('should filter work orders by customer ID', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [serviceId], [], 'RECEIVED');
      await client.post('/work-orders', workOrderData);

      const response = await client.get('/work-orders', {
        params: { customerId },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
      response.data.content.forEach((workOrder: any) => {
        expect(workOrder.customer.id).toBe(customerId);
      });
    });

    it('should filter work orders by vehicle ID', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [serviceId], [], 'RECEIVED');
      await client.post('/work-orders', workOrderData);

      const response = await client.get('/work-orders', {
        params: { vehicleId },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
      response.data.content.forEach((workOrder: any) => {
        expect(workOrder.vehicle.id).toBe(vehicleId);
      });
    });

    it('should filter work orders by status', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [serviceId], [], 'IN_DIAGNOSIS');
      await client.post('/work-orders', workOrderData);

      const response = await client.get('/work-orders', {
        params: { status: 'IN_DIAGNOSIS' },
      });

      expect(response.status).toBe(200);
      response.data.content.forEach((workOrder: any) => {
        expect(workOrder.status).toBe('IN_DIAGNOSIS');
      });
    });

    it('should filter work orders by budget range', async () => {
      const response = await client.get('/work-orders', {
        params: { minBudget: 0, maxBudget: 1000 },
      });

      expect(response.status).toBe(200);
      response.data.content.forEach((workOrder: any) => {
        expect(workOrder.budget).toBeGreaterThanOrEqual(0);
        expect(workOrder.budget).toBeLessThanOrEqual(1000);
      });
    });
  });

  describe('GET /api/work-orders/:id (Get Work Order by ID)', () => {
    it('should get work order by valid ID', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [serviceId], [partId], 'RECEIVED');
      const createResponse = await client.post('/work-orders', workOrderData);
      const workOrderId = createResponse.data.id;

      const response = await client.get(`/work-orders/${workOrderId}`);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(workOrderId);
      expect(response.data.customer.id).toBe(customerId);
      expect(response.data.vehicle.id).toBe(vehicleId);
    });

    it('should get work order without authentication (optional auth)', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [serviceId], [], 'RECEIVED');
      const createResponse = await client.post('/work-orders', workOrderData);
      const workOrderId = createResponse.data.id;

      const unauthClient = new ApiClient();
      const response = await unauthClient.get(`/work-orders/${workOrderId}`);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(workOrderId);
    });

    it('should return 404 for non-existent work order ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.get(`/work-orders/${fakeId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 400 for invalid UUID format', async () => {
      try {
        await client.get('/work-orders/invalid-id');
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });
  });

  describe('PATCH /api/work-orders/:id (Update Work Order)', () => {
    it('should update work order status', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [serviceId], [], 'RECEIVED');
      const createResponse = await client.post('/work-orders', workOrderData);
      const workOrderId = createResponse.data.id;

      const response = await client.patch(`/work-orders/${workOrderId}`, {
        status: 'IN_DIAGNOSIS',
      });

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(workOrderId);
      expect(response.data.status).toBe('IN_DIAGNOSIS');
    });

    it('should update work order services', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [serviceId], [], 'RECEIVED');
      const createResponse = await client.post('/work-orders', workOrderData);
      const workOrderId = createResponse.data.id;

      const newServiceData = generateServiceData();
      const newServiceResponse = await client.post('/services', newServiceData);
      const newServiceId = newServiceResponse.data.id;

      const response = await client.patch(`/work-orders/${workOrderId}`, {
        serviceIds: [serviceId, newServiceId],
      });

      expect(response.status).toBe(200);
    });

    it('should update work order parts', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [serviceId], [], 'RECEIVED');
      const createResponse = await client.post('/work-orders', workOrderData);
      const workOrderId = createResponse.data.id;

      const response = await client.patch(`/work-orders/${workOrderId}`, {
        partAndSupplyIds: [partId],
      });

      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent work order ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.patch(`/work-orders/${fakeId}`, { status: 'IN_DIAGNOSIS' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });
  });

  describe('DELETE /api/work-orders/:id (Delete Work Order)', () => {
    it('should delete work order by ID', async () => {
      const workOrderData = generateWorkOrderData(customerId, vehicleId, [serviceId], [], 'RECEIVED');
      const createResponse = await client.post('/work-orders', workOrderData);
      const workOrderId = createResponse.data.id;

      const response = await client.delete(`/work-orders/${workOrderId}`);

      expect(response.status).toBe(204);

      try {
        await client.get(`/work-orders/${workOrderId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 404 for non-existent work order ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.delete(`/work-orders/${fakeId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });
  });
});
