import { buildRoute } from '@/main/adapters';
import { userResponseSchema } from '@/main/docs';
import {
  makeCreateUserController,
  makeDeleteUserController,
  makeGetAllUsersController,
  makeGetUserByIdController,
  makeUpdateUserController,
} from '@/main/factories/controllers';
import { authMiddleware } from '@/main/middlewares';
import { FastifyInstance } from 'fastify';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post(
    '',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Create User',
        description:
          'Creates a new user account in the auto repair shop system. Users can be administrators with full access or default users with limited permissions. Requires unique email address.',
        tags: ['user'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          description: 'User creation payload',
          properties: {
            name: {
              type: 'string',
              description: 'Full name of the user',
              minLength: 2,
              maxLength: 100,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address (must be unique)',
            },
            password: {
              type: 'string',
              description: 'User password (will be encrypted)',
              minLength: 8,
              maxLength: 128,
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'DEFAULT'],
              description: 'User role: ADMIN (full access) or DEFAULT (limited access)',
            },
          },
          required: ['name', 'email', 'password', 'role'],
        },
        response: {
          201: {
            description: 'User created successfully',
            ...userResponseSchema,
          },
          400: {
            description: 'Bad Request',
            type: 'object',
            properties: {
              message: { type: 'string' },
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
    buildRoute(makeCreateUserController())
  );
  fastify.get(
    '',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'List Users',
        description:
          'Retrieves a paginated list of all system users. Supports filtering by name, email, and role, with sorting options. Password information is never returned in the response.',
        tags: ['user'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          description: 'Query parameters for filtering, pagination, and sorting',
          properties: {
            page: {
              type: 'number',
              default: 1,
              minimum: 1,
              description: 'Page number for pagination',
            },
            limit: {
              type: 'number',
              default: 10,
              minimum: 1,
              maximum: 100,
              description: 'Number of items per page',
            },
            orderBy: {
              type: 'string',
              enum: ['name', 'createdAt'],
              default: 'createdAt',
              description: 'Field to sort by',
            },
            orderDirection: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'asc',
              description: 'Sort direction (ascending or descending)',
            },
            name: {
              type: 'string',
              description: 'Filter by user name (partial match)',
            },
            email: {
              type: 'string',
              description: 'Filter by user email (partial match)',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'DEFAULT'],
              description: 'Filter by user role',
            },
          },
        },
        response: {
          200: {
            description: 'List of all users',
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
              content: {
                type: 'array',
                items: userResponseSchema,
              },
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
    buildRoute(makeGetAllUsersController())
  );
  fastify.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Get User by ID',
        description:
          'Retrieves detailed information about a specific user by their unique identifier. Password information is never included in the response for security reasons.',
        tags: ['user'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the user',
              format: 'uuid',
            },
          },
          required: ['id'],
        },
        response: {
          200: {
            description: 'User retrieved successfully',
            ...userResponseSchema,
          },
          400: {
            description: 'Bad Request',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          404: {
            description: 'Not found',
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
    buildRoute(makeGetUserByIdController())
  );
  fastify.patch(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Update User',
        description:
          'Updates an existing user account. All fields are optional - only provided fields will be updated. Password updates are encrypted before storage. Email changes require uniqueness validation.',
        tags: ['user'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the user to update',
              format: 'uuid',
            },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          description: 'User update payload (all fields optional)',
          properties: {
            name: {
              type: 'string',
              description: 'Updated user name',
              minLength: 2,
              maxLength: 100,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Updated email address (must remain unique)',
            },
            password: {
              type: 'string',
              description: 'New password (will be encrypted)',
              minLength: 8,
              maxLength: 128,
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'DEFAULT'],
              description: 'Updated user role',
            },
          },
        },
        response: {
          200: {
            description: 'User updated successfully',
            ...userResponseSchema,
          },
          400: {
            description: 'Bad Request',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          404: {
            description: 'User not found',
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
    buildRoute(makeUpdateUserController())
  );
  fastify.delete(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Delete User',
        description:
          'Permanently removes a user account from the system. This action cannot be undone. Consider deactivating users instead of deletion to maintain audit trails.',
        tags: ['user'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the user to delete',
              format: 'uuid',
            },
          },
          required: ['id'],
        },
        response: {
          204: {
            description: 'User deleted successfully',
          },
          404: {
            description: 'User not found',
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
    buildRoute(makeDeleteUserController())
  );
}
