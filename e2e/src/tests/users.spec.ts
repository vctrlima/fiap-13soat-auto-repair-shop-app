import { ApiClient, isErrorStatus } from '../helpers/api-client';
import { createTestUser } from '../helpers/auth-helper';
import { generateUserData } from '../helpers/test-data';

describe('Users E2E Tests', () => {
  let client: ApiClient;
  let authToken: string;

  beforeAll(async () => {
    const { tokens } = await createTestUser();
    authToken = tokens.accessToken;
    client = new ApiClient(authToken);
  });

  describe('POST /api/users (Create User)', () => {
    it('should create a new user with valid data', async () => {
      const userData = generateUserData();

      const response = await client.post('/users', {
        ...userData,
        role: 'DEFAULT',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe(userData.name);
      expect(response.data.email).toBe(userData.email);
      expect(response.data.role).toBe('DEFAULT');
      expect(response.data).not.toHaveProperty('password');
    });

    it('should create an admin user', async () => {
      const userData = generateUserData();

      const response = await client.post('/users', {
        ...userData,
        role: 'ADMIN',
      });

      expect(response.status).toBe(201);
      expect(response.data.role).toBe('ADMIN');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = generateUserData();

      try {
        await client.post('/users', {
          ...userData,
          email: 'invalid-email',
          role: 'DEFAULT',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 400 for short password', async () => {
      const userData = generateUserData();

      try {
        await client.post('/users', {
          ...userData,
          password: 'short',
          role: 'DEFAULT',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 401 without authentication', async () => {
      const userData = generateUserData();
      const unauthClient = new ApiClient();

      try {
        await unauthClient.post('/users', {
          ...userData,
          role: 'DEFAULT',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 401)).toBe(true);
      }
    });

    it('should return 500 for duplicate email', async () => {
      const userData = generateUserData();

      await client.post('/users', {
        ...userData,
        role: 'DEFAULT',
      });

      try {
        await client.post('/users', {
          ...userData,
          role: 'DEFAULT',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 500)).toBe(true);
      }
    });
  });

  describe('GET /api/users (List Users)', () => {
    it('should list users with pagination', async () => {
      const response = await client.get('/users', {
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

    it('should filter users by name', async () => {
      const userData = generateUserData();
      await client.post('/users', { ...userData, role: 'DEFAULT' });

      const response = await client.get('/users', {
        params: { name: userData.name },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
      expect(response.data.content[0].name).toContain(userData.name);
    });

    it('should filter users by email', async () => {
      const userData = generateUserData();
      await client.post('/users', { ...userData, role: 'DEFAULT' });

      const response = await client.get('/users', {
        params: { email: userData.email },
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);
      expect(response.data.content[0].email).toContain(userData.email);
    });

    it('should filter users by role', async () => {
      const response = await client.get('/users', {
        params: { role: 'ADMIN' },
      });

      expect(response.status).toBe(200);
      response.data.content.forEach((user: any) => {
        expect(user.role).toBe('ADMIN');
      });
    });

    it('should sort users by name ascending', async () => {
      const response = await client.get('/users', {
        params: { orderBy: 'name', orderDirection: 'asc' },
      });

      expect(response.status).toBe(200);
      const names = response.data.content.map((user: any) => user.name);
      expect(names).toEqual([...names].sort());
    });

    it('should sort users by createdAt descending', async () => {
      const response = await client.get('/users', {
        params: { orderBy: 'createdAt', orderDirection: 'desc' },
      });

      expect(response.status).toBe(200);
      const dates = response.data.content.map((user: any) => new Date(user.createdAt).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });
  });

  describe('GET /api/users/:id (Get User by ID)', () => {
    it('should get user by valid ID', async () => {
      const userData = generateUserData();
      const createResponse = await client.post('/users', { ...userData, role: 'DEFAULT' });
      const userId = createResponse.data.id;

      const response = await client.get(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(userId);
      expect(response.data.name).toBe(userData.name);
      expect(response.data).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.get(`/users/${fakeId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 400 for invalid UUID format', async () => {
      try {
        await client.get('/users/invalid-id');
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });
  });

  describe('PATCH /api/users/:id (Update User)', () => {
    it('should update user name', async () => {
      const userData = generateUserData();
      const createResponse = await client.post('/users', { ...userData, role: 'DEFAULT' });
      const userId = createResponse.data.id;

      const newName = `Updated ${userData.name}`;
      const response = await client.patch(`/users/${userId}`, { name: newName });

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(userId);
      expect(response.data.name).toBe(newName);
    });

    it('should update user email', async () => {
      const userData = generateUserData();
      const createResponse = await client.post('/users', { ...userData, role: 'DEFAULT' });
      const userId = createResponse.data.id;

      const newEmail = `updated.${userData.email}`;
      const response = await client.patch(`/users/${userId}`, { email: newEmail });

      expect(response.status).toBe(200);
      expect(response.data.email).toBe(newEmail);
    });

    it('should update user password', async () => {
      const userData = generateUserData();
      const createResponse = await client.post('/users', { ...userData, role: 'DEFAULT' });
      const userId = createResponse.data.id;

      const response = await client.patch(`/users/${userId}`, {
        password: 'NewPassword@123',
      });

      expect(response.status).toBe(200);
      expect(response.data).not.toHaveProperty('password');
    });

    it('should update user role', async () => {
      const userData = generateUserData();
      const createResponse = await client.post('/users', { ...userData, role: 'DEFAULT' });
      const userId = createResponse.data.id;

      const response = await client.patch(`/users/${userId}`, { role: 'ADMIN' });

      expect(response.status).toBe(200);
      expect(response.data.role).toBe('ADMIN');
    });

    it('should return 404 for non-existent user ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.patch(`/users/${fakeId}`, { name: 'Updated Name' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });

    it('should return 400 for invalid email format', async () => {
      const userData = generateUserData();
      const createResponse = await client.post('/users', { ...userData, role: 'DEFAULT' });
      const userId = createResponse.data.id;

      try {
        await client.patch(`/users/${userId}`, { email: 'invalid-email' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });
  });

  describe('DELETE /api/users/:id (Delete User)', () => {
    it('should delete user by ID', async () => {
      const userData = generateUserData();
      const createResponse = await client.post('/users', { ...userData, role: 'DEFAULT' });
      const userId = createResponse.data.id;

      const response = await client.delete(`/users/${userId}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent user ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await client.delete(`/users/${fakeId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 404)).toBe(true);
      }
    });
  });
});
