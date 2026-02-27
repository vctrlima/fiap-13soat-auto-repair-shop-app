import { buildRoute } from '@/main/adapters';
import { vehicleResponseSchema } from '@/main/docs';
import {
  makeCreateVehicleController,
  makeDeleteVehicleController,
  makeGetAllVehiclesController,
  makeGetVehicleByIdController,
  makeUpdateVehicleController,
} from '@/main/factories/controllers';
import { authMiddleware } from '@/main/middlewares';
import { FastifyInstance } from 'fastify';

export default async function vehicleRoutes(fastify: FastifyInstance) {
  fastify.post(
    '',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Create Vehicle',
        description:
          'Registers a new vehicle in the auto repair shop system. Each vehicle must be associated with an existing customer and have a unique license plate within the system.',
        tags: ['vehicle'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          description: 'Vehicle registration payload',
          properties: {
            customerId: {
              type: 'string',
              description: 'Unique identifier of the vehicle owner (customer)',
              format: 'uuid',
            },
            licensePlate: {
              type: 'string',
              maxLength: 7,
              description: 'Vehicle license plate number (must be unique)',
              pattern: '^[A-Z0-9-]+$',
            },
            brand: {
              type: 'string',
              description: 'Vehicle manufacturer/brand',
              minLength: 2,
              maxLength: 50,
            },
            model: {
              type: 'string',
              description: 'Vehicle model name',
              minLength: 1,
              maxLength: 50,
            },
            year: {
              type: 'number',
              minimum: 1900,
              maximum: 2030,
              description: 'Vehicle manufacturing year',
            },
          },
          required: ['customerId', 'licensePlate', 'brand', 'model', 'year'],
        },
        response: {
          201: {
            description: 'Vehicle created successfully',
            ...vehicleResponseSchema,
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
    buildRoute(makeCreateVehicleController())
  );
  fastify.get(
    '',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'List Vehicles',
        description:
          'Retrieves a paginated list of all registered vehicles. Supports filtering by customer, license plate, brand, model, and year, with multiple sorting options.',
        tags: ['vehicle'],
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
              enum: ['licensePlate', 'brand', 'model', 'year', 'createdAt'],
              default: 'createdAt',
              description: 'Field to sort by',
            },
            orderDirection: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'asc',
              description: 'Sort direction (ascending or descending)',
            },
            customerId: {
              type: 'string',
              description: 'Filter by customer ID to show only their vehicles',
            },
            licensePlate: {
              type: 'string',
              description: 'Filter by license plate (partial match)',
            },
            brand: {
              type: 'string',
              description: 'Filter by vehicle brand (partial match)',
            },
            model: {
              type: 'string',
              description: 'Filter by vehicle model (partial match)',
            },
            year: {
              type: 'number',
              description: 'Filter by specific manufacturing year',
            },
          },
        },
        response: {
          200: {
            description: 'List of all vehicles',
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
              content: {
                type: 'array',
                items: vehicleResponseSchema,
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
    buildRoute(makeGetAllVehiclesController())
  );
  fastify.get(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Get Vehicle by ID',
        description:
          'Retrieves detailed information about a specific vehicle by its unique identifier. Includes all vehicle specifications and owner information.',
        tags: ['vehicle'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the vehicle',
              format: 'uuid',
            },
          },
          required: ['id'],
        },
        response: {
          200: {
            description: 'Vehicle retrieved successfully',
            ...vehicleResponseSchema,
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
    buildRoute(makeGetVehicleByIdController())
  );
  fastify.patch(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Update Vehicle',
        description:
          'Updates an existing vehicle registration. All fields are optional - only provided fields will be updated. License plate changes require uniqueness validation.',
        tags: ['vehicle'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the vehicle to update',
              format: 'uuid',
            },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          description: 'Vehicle update payload (all fields optional)',
          properties: {
            licensePlate: {
              type: 'string',
              maxLength: 7,
              description: 'Updated license plate number (must remain unique)',
              pattern: '^[A-Z0-9-]+$',
            },
            brand: {
              type: 'string',
              description: 'Updated vehicle brand',
              minLength: 2,
              maxLength: 50,
            },
            model: {
              type: 'string',
              description: 'Updated vehicle model',
              minLength: 1,
              maxLength: 50,
            },
            year: {
              type: 'number',
              minimum: 1900,
              maximum: 2030,
              description: 'Updated manufacturing year',
            },
            customerId: {
              type: 'string',
              description: 'Updated owner customer ID (if ownership transferred)',
              format: 'uuid',
            },
          },
        },
        response: {
          200: {
            description: 'Vehicle updated successfully',
            ...vehicleResponseSchema,
          },
          400: {
            description: 'Bad Request',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          404: {
            description: 'Vehicle not found',
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
    buildRoute(makeUpdateVehicleController())
  );
  fastify.delete(
    '/:id',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Delete Vehicle',
        description:
          'Permanently removes a vehicle registration from the system. This action cannot be undone. All associated work orders and service history will also be affected.',
        tags: ['vehicle'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the vehicle to delete',
              format: 'uuid',
            },
          },
          required: ['id'],
        },
        response: {
          204: {
            description: 'Vehicle deleted successfully',
          },
          404: {
            description: 'Vehicle not found',
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
    buildRoute(makeDeleteVehicleController())
  );
}
