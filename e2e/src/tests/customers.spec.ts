import { ApiClient, isErrorStatus } from '../helpers/api-client';
import { createTestUser } from '../helpers/auth-helper';
import { generateCPF, generateCustomerData } from '../helpers/test-data';

describe('Customers E2E Tests', () => {
  let client: ApiClient;
  let authToken: string;

  beforeAll(async () => {
    const { tokens } = await createTestUser();
    authToken = tokens.accessToken;
    client = new ApiClient(authToken);
  });

  describe('POST /api/customers (Create Customer)', () => {
    it('should create a new individual customer with valid data', async () => {
      const customerData = generateCustomerData('individual');

      const response = await client.post('/customers', customerData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe(customerData.name);
      expect(response.data.document).toBe(customerData.document);
      expect(response.data.email).toBe(customerData.email);
      expect(response.data.phone).toBe(customerData.phone);
    });

    it('should create a new company customer with valid data', async () => {
      const customerData = generateCustomerData('company');

      const response = await client.post('/customers', customerData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.document).toBe(customerData.document);
      expect(response.data.document.length).toBe(14);
    });

    it('should return 400 for invalid CPF format', async () => {
      const customerData = generateCustomerData('individual');

      try {
        await client.post('/customers', {
          ...customerData,
          document: '12345678901',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 400 for invalid email format', async () => {
      const customerData = generateCustomerData('individual');

      try {
        await client.post('/customers', {
          ...customerData,
          email: 'invalid-email',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 500 for duplicate document', async () => {
      const customerData = generateCustomerData('individual');

      await client.post('/customers', customerData);

      try {
        await client.post('/customers', customerData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 500)).toBe(true);
      }
    });

    it('should return 401 without authentication', async () => {
      const customerData = generateCustomerData('individual');
      const unauthClient = new ApiClient();

      try {
        await unauthClient.post('/customers', customerData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 401)).toBe(true);
      }
    });
  });

  describe('GET /api/customers (List Customers)', () => {
    it('should list customers with pagination', async () => {
      const response = await client.get('/customers', {
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

    it('should filter customers by name', async () => {
      const customerData = generateCustomerData('individual');
      await client.post('/customers', customerData);

      const response = await client.get('/customers', {
        params: { name: customerData.name },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
      expect(response.data.content[0].name).toContain(customerData.name);
    });

    it('should filter customers by document', async () => {
      const customerData = generateCustomerData('individual');
      await client.post('/customers', customerData);

      const response = await client.get('/customers', {
        params: { document: customerData.document },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
      expect(response.data.content[0].document).toBe(customerData.document);
    });

    it('should filter customers by email', async () => {
      const customerData = generateCustomerData('individual');
      await client.post('/customers', customerData);

      const response = await client.get('/customers', {
        params: { email: customerData.email },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
      expect(response.data.content[0].email).toContain(customerData.email);
    });

    it('should sort customers by name ascending', async () => {
      const response = await client.get('/customers', {
        params: { orderBy: 'name', orderDirection: 'asc' },
      });

      expect(response.status).toBe(200);
      const names = response.data.content.map((customer: any) => customer.name);
      expect(names).toEqual([...names].sort());
    });
  });

  describe('GET /api/customers/:document (Get Customer by Document)', () => {
    it('should get customer by valid CPF document', async () => {
      const customerData = generateCustomerData('individual');
      await client.post('/customers', customerData);

      const response = await client.get(`/customers/${customerData.document}`);

      expect(response.status).toBe(200);
      expect(response.data.document).toBe(customerData.document);
      expect(response.data.name).toBe(customerData.name);
    });

    it('should get customer by valid CNPJ document', async () => {
      const customerData = generateCustomerData('company');
      await client.post('/customers', customerData);

      const response = await client.get(`/customers/${customerData.document}`);

      expect(response.status).toBe(200);
      expect(response.data.document).toBe(customerData.document);
    });

    it('should return 404 for non-existent document', async () => {
      const fakeDocument = generateCPF();

      try {
        await client.get(`/customers/${fakeDocument}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 400 for invalid document format', async () => {
      try {
        await client.get('/customers/invalid-document');
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });
  });

  describe('PATCH /api/customers/:document (Update Customer)', () => {
    it('should update customer name', async () => {
      const customerData = generateCustomerData('individual');
      await client.post('/customers', customerData);

      const newName = `Updated ${customerData.name}`;
      const response = await client.patch(`/customers/${customerData.document}`, {
        name: newName,
      });

      expect(response.status).toBe(200);
      expect(response.data.document).toBe(customerData.document);
      expect(response.data.name).toBe(newName);
    });

    it('should update customer email', async () => {
      const customerData = generateCustomerData('individual');
      await client.post('/customers', customerData);

      const newEmail = `updated.${customerData.email}`;
      const response = await client.patch(`/customers/${customerData.document}`, {
        email: newEmail,
      });

      expect(response.status).toBe(200);
      expect(response.data.email).toBe(newEmail);
    });

    it('should update customer phone', async () => {
      const customerData = generateCustomerData('individual');
      await client.post('/customers', customerData);

      const newPhone = '11999999999';
      const response = await client.patch(`/customers/${customerData.document}`, {
        phone: newPhone,
      });

      expect(response.status).toBe(200);
      expect(response.data.phone).toBe(newPhone);
    });

    it('should return 404 for non-existent document', async () => {
      const fakeDocument = generateCPF();

      try {
        await client.patch(`/customers/${fakeDocument}`, { name: 'Updated Name' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 400 for invalid email format', async () => {
      const customerData = generateCustomerData('individual');
      await client.post('/customers', customerData);

      try {
        await client.patch(`/customers/${customerData.document}`, { email: 'invalid-email' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });
  });

  describe('DELETE /api/customers/:document (Delete Customer)', () => {
    it('should delete customer by document', async () => {
      const customerData = generateCustomerData('individual');
      await client.post('/customers', customerData);

      const response = await client.delete(`/customers/${customerData.document}`);

      expect(response.status).toBe(204);

      try {
        await client.get(`/customers/${customerData.document}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 404 for non-existent document', async () => {
      const fakeDocument = generateCPF();

      try {
        await client.delete(`/customers/${fakeDocument}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });
  });
});
