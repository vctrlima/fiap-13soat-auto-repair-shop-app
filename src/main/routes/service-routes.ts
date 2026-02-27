import { buildRoute } from '@/main/adapters';
import { serviceResponseSchema } from '@/main/docs';
import {
  makeCreateServiceController,
  makeDeleteServiceController,
  makeGetAllServicesController,
  makeGetServiceByIdController,
  makeUpdateServiceController,
} from '@/main/factories/controllers';
import { authMiddleware } from '@/main/middlewares';
import { FastifyInstance } from 'fastify';

export default async function serviceRoutes(fastify: FastifyInstance) {
  fastify.post(
    '',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Create Service',
        description:
          'Creates a new automotive service offering in the system. Services represent different types of repairs, maintenance, or diagnostic procedures that can be performed on vehicles.',
        tags: ['service'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          description: 'Service creation payload',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the service',
              minLength: 2,
              maxLength: 100,
            },
            description: {
              type: 'string',
              description: 'Detailed description of what the service includes',
              maxLength: 1000,
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Service price in the local currency',
            },
          },
          required: ['name', 'price'],
        },
        response: {
          201: {
            description: 'Service created successfully',
            ...serviceResponseSchema,
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
    buildRoute(makeCreateServiceController())
  );
  fastify.get(
    '',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'List Services',
        description:
          'Retrieves a paginated list of all available automotive services. Supports filtering by service name and sorting options for easy browsing of service offerings.',
        tags: ['service'],
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
              description: 'Filter by service name (partial match)',
            },
          },
        },
        response: {
          200: {
            description: 'List of all services',
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
              content: {
                type: 'array',
                items: serviceResponseSchema,
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
    buildRoute(makeGetAllServicesController())
  );
  fastify.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Get Service by ID',
        description:
          'Retrieves detailed information about a specific automotive service by its unique identifier. Includes pricing and full service description.',
        tags: ['service'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the service',
              format: 'uuid',
            },
          },
          required: ['id'],
        },
        response: {
          200: {
            description: 'Service retrieved successfully',
            ...serviceResponseSchema,
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
    buildRoute(makeGetServiceByIdController())
  );
  fastify.patch(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Update Service',
        description:
          'Updates an existing automotive service. All fields are optional - only provided fields will be updated. Commonly used for price adjustments or service description updates.',
        tags: ['service'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the service to update',
              format: 'uuid',
            },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          description: 'Service update payload (all fields optional)',
          properties: {
            name: {
              type: 'string',
              description: 'Updated service name',
              minLength: 2,
              maxLength: 100,
            },
            description: {
              type: 'string',
              description: 'Updated service description',
              maxLength: 1000,
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Updated service price',
            },
          },
        },
        response: {
          200: {
            description: 'Service updated successfully',
            ...serviceResponseSchema,
          },
          400: {
            description: 'Bad Request',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          404: {
            description: 'Service not found',
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
    buildRoute(makeUpdateServiceController())
  );
  fastify.delete(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Delete Service',
        description:
          'Permanently removes a service from the system. This action cannot be undone. The service will no longer be available for use in new work orders.',
        tags: ['service'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the service to delete',
              format: 'uuid',
            },
          },
          required: ['id'],
        },
        response: {
          204: {
            description: 'Service deleted successfully',
          },
          404: {
            description: 'Service not found',
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
    buildRoute(makeDeleteServiceController())
  );
}
