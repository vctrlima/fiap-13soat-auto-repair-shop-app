import { buildRoute } from '@/main/adapters';
import { serviceMetricsResponseSchema } from '@/main/docs';
import {
  makeGetAllServiceMetricsController,
  makeGetServiceMetricsByIdController,
} from '@/main/factories/controllers';
import { authMiddleware } from '@/main/middlewares';
import { FastifyInstance } from 'fastify';

export default async function serviceMetricsRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/services',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'List Metrics for Service Metrics',
        description: 'Retrieves a paginated list of service metrics with optional filtering and sorting.',
        tags: ['metrics'],
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
              description: 'Filter by customer name (partial match)',
            },
            document: {
              type: 'string',
              description: 'Filter by customer document',
            },
            email: {
              type: 'string',
              description: 'Filter by customer email (partial match)',
            },
            phone: {
              type: 'string',
              description: 'Filter by customer phone number',
            },
          },
        },
        response: {
          200: {
            description: 'List of all customers',
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
              content: {
                type: 'array',
                items: serviceMetricsResponseSchema,
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
    buildRoute(makeGetAllServiceMetricsController())
  );
  fastify.get(
    '/services/:id',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Get Service Metrics by ID',
        description:
          'Retrieves a specific service metrics by its ID. Returns detailed service metrics information if found.',
        tags: ['metrics'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            id: {
              type: 'string',
              description: 'Service ID',
              format: 'uuid',
            },
          },
          required: ['id'],
        },
        response: {
          200: {
            description: 'Service metrics retrieved successfully',
            ...serviceMetricsResponseSchema,
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
    buildRoute(makeGetServiceMetricsByIdController())
  );
}
