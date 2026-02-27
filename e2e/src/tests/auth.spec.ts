import axios from 'axios';
import { isErrorStatus } from '../helpers/api-client';
import { createTestUser } from '../helpers/auth-helper';

describe('Auth E2E Tests', () => {
  describe('POST /api/auth (Login)', () => {
    it('should authenticate user with valid credentials', async () => {
      const { user } = await createTestUser();

      const response = await axios.post('/auth', {
        email: user.email,
        password: user.password,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data).toHaveProperty('refreshToken');
      expect(response.data.user.email).toBe(user.email);
      expect(response.data.user).not.toHaveProperty('password');
    });

    it('should return 400 for invalid email format', async () => {
      try {
        await axios.post('/auth', {
          email: 'invalid-email',
          password: 'Test@1234',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 400 for missing password', async () => {
      try {
        await axios.post('/auth', {
          email: 'test@example.com',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 401 for invalid credentials', async () => {
      try {
        await axios.post('/auth', {
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 401)).toBe(true);
      }
    });

    it('should return 401 for wrong password', async () => {
      const { user } = await createTestUser();

      try {
        await axios.post('/auth', {
          email: user.email,
          password: 'WrongPassword123!',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 401)).toBe(true);
      }
    });
  });

  describe('POST /api/auth/refresh (Refresh Token)', () => {
    it('should refresh access token with valid refresh token', async () => {
      const { user, tokens } = await createTestUser();

      const response = await axios.post('/auth/refresh', {
        refreshToken: tokens.refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data).toHaveProperty('refreshToken');
      expect(response.data.user.email).toBe(user.email);
    });

    it('should return 400 for missing refresh token', async () => {
      try {
        await axios.post('/auth/refresh', {});
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 400)).toBe(true);
      }
    });

    it('should return 401 for invalid refresh token', async () => {
      try {
        await axios.post('/auth/refresh', {
          refreshToken: 'invalid-token',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 401)).toBe(true);
      }
    });

    it('should return 401 for expired refresh token', async () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj0vt48gj7N3ykN95NdNKQmSXbU9ChjRDfFy4KBQ';

      try {
        await axios.post('/auth/refresh', {
          refreshToken: expiredToken,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 401)).toBe(true);
      }
    });

    it('should invalidate old refresh token after successful refresh', async () => {
      const { tokens } = await createTestUser();

      await axios.post('/auth/refresh', {
        refreshToken: tokens.refreshToken,
      });

      try {
        await axios.post('/auth/refresh', {
          refreshToken: tokens.refreshToken,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(isErrorStatus(error, 401)).toBe(true);
      }
    });
  });
});
