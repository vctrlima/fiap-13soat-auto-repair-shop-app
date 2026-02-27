import { buildRoute } from '@/main/adapters';
import { partOrSupplyResponseSchema } from '@/main/docs';
import {
  makeCreatePartOrSupplyController,
  makeDeletePartOrSupplyController,
  makeGetAllPartsOrSuppliesController,
  makeGetPartOrSupplyByIdController,
  makeUpdatePartOrSupplyController,
} from '@/main/factories/controllers';
import { authMiddleware } from '@/main/middlewares';
import { FastifyInstance } from 'fastify';

export default async function partOrSupplyRoutes(fastify: FastifyInstance) {
  fastify.post(
    '',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Create Part or Supply',
        description:
          'Creates a new automotive part or supply item in the inventory system. Used for managing spare parts, tools, fluids, and other supplies needed for vehicle repairs.',
        tags: ['part-or-supply'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          description: 'Part or supply creation payload',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the part or supply item',
              minLength: 2,
              maxLength: 100,
            },
            description: {
              type: 'string',
              description: 'Detailed description of the part or supply',
              maxLength: 500,
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Unit price in the local currency',
            },
            inStock: {
              type: 'number',
              minimum: 0,
              description: 'Current quantity available in stock',
            },
          },
          required: ['name', 'price', 'inStock'],
        },
        response: {
          201: {
            description: 'Part or supply created successfully',
            ...partOrSupplyResponseSchema,
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
    buildRoute(makeCreatePartOrSupplyController())
  );
  fastify.get(
    '',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'List Parts and Supplies',
        description:
          'Retrieves a paginated list of all automotive parts and supplies in the inventory. Supports filtering by name and stock availability, with sorting options.',
        tags: ['part-or-supply'],
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
              description: 'Filter by part/supply name (partial match)',
            },
            inStock: {
              type: 'boolean',
              description: 'Filter by stock availability (true = in stock, false = out of stock)',
            },
          },
        },
        response: {
          200: {
            description: 'List of all parts or supplies',
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
              content: {
                type: 'array',
                items: partOrSupplyResponseSchema,
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
    buildRoute(makeGetAllPartsOrSuppliesController())
  );
  fastify.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Get Part or Supply by ID',
        description:
          'Retrieves detailed information about a specific automotive part or supply item by its unique identifier.',
        tags: ['part-or-supply'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the part or supply item',
              format: 'uuid',
            },
          },
          required: ['id'],
        },
        response: {
          200: {
            description: 'Part or supply retrieved successfully',
            ...partOrSupplyResponseSchema,
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
    buildRoute(makeGetPartOrSupplyByIdController())
  );
  fastify.patch(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Update Part or Supply',
        description:
          'Updates an existing automotive part or supply item. All fields are optional - only provided fields will be updated. Commonly used for updating prices, stock levels, or descriptions.',
        tags: ['part-or-supply'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the part or supply to update',
              format: 'uuid',
            },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          description: 'Part or supply update payload (all fields optional)',
          properties: {
            name: {
              type: 'string',
              description: 'Updated name of the part or supply',
              minLength: 2,
              maxLength: 100,
            },
            description: {
              type: 'string',
              description: 'Updated description',
              maxLength: 500,
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Updated unit price',
            },
            inStock: {
              type: 'number',
              minimum: 0,
              description: 'Updated stock quantity',
            },
          },
        },
        response: {
          200: {
            description: 'Part or supply updated successfully',
            ...partOrSupplyResponseSchema,
          },
          400: {
            description: 'Bad Request',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          404: {
            description: 'Part or supply not found',
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
    buildRoute(makeUpdatePartOrSupplyController())
  );
  fastify.delete(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Delete Part or Supply',
        description:
          'Permanently removes a part or supply item from the inventory system. This action cannot be undone. The item will no longer be available for use in work orders.',
        tags: ['part-or-supply'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the part or supply to delete',
              format: 'uuid',
            },
          },
          required: ['id'],
        },
        response: {
          204: {
            description: 'Part or supply deleted successfully',
          },
          404: {
            description: 'Part or supply not found',
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
    buildRoute(makeDeletePartOrSupplyController())
  );
}
