import { buildRoute } from '@/main/adapters';
import { makeAuthenticateUserController, makeRefreshTokenController } from '@/main/factories/controllers';
import { optionalAuthMiddleware } from '@/main/middlewares';
import { FastifyInstance } from 'fastify';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    '',
    {
      schema: {
        summary: 'Authenticate User',
        description:
          'Authenticates a user with email and password credentials. Returns user information (without password) along with access and refresh tokens for API authentication.',
        tags: ['auth'],
        body: {
          type: 'object',
          description: 'User authentication credentials',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              description: 'User password',
              minLength: 1,
            },
          },
          required: ['email', 'password'],
        },
        response: {
          200: {
            description: 'Authentication successful',
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  role: { type: 'string', enum: ['ADMIN', 'DEFAULT'] },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time', nullable: true },
                },
              },
              accessToken: {
                type: 'string',
                description: 'JWT access token (expires in 15 minutes)',
              },
              refreshToken: {
                type: 'string',
                description: 'JWT refresh token (expires in 7 days)',
              },
            },
          },
          400: {
            description: 'Bad Request - Invalid email or password format',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          401: {
            description: 'Unauthorized - Invalid credentials',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          500: {
            description: 'Internal Server Error',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    buildRoute(makeAuthenticateUserController())
  );
  fastify.post(
    '/refresh',
    {
      preHandler: optionalAuthMiddleware,
      schema: {
        summary: 'Refresh Access Token',
        description:
          'Refreshes an expired access token using a valid refresh token. Returns new access and refresh tokens along with user information. The old refresh token is invalidated.',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          description: 'Refresh token request payload',
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Valid refresh token received from authentication',
            },
          },
          required: ['refreshToken'],
        },
        response: {
          200: {
            description: 'Token refresh successful',
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  role: { type: 'string', enum: ['ADMIN', 'DEFAULT'] },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time', nullable: true },
                },
              },
              accessToken: {
                type: 'string',
                description: 'New JWT access token (expires in 15 minutes)',
              },
              refreshToken: {
                type: 'string',
                description: 'New JWT refresh token (expires in 7 days)',
              },
            },
          },
          400: {
            description: 'Bad Request - Missing refresh token',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          401: {
            description: 'Unauthorized - Invalid or expired refresh token',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          500: {
            description: 'Internal Server Error',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    buildRoute(makeRefreshTokenController())
  );
}
