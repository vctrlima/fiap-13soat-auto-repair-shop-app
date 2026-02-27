import { buildRoute } from '@/main/adapters';
import { customerResponseSchema } from '@/main/docs';
import {
  makeCreateCustomerController,
  makeDeleteCustomerController,
  makeGetAllCustomersController,
  makeGetCustomerByDocumentController,
  makeUpdateCustomerController,
} from '@/main/factories/controllers';
import { authMiddleware } from '@/main/middlewares';
import { FastifyInstance } from 'fastify';

export default async function customerRoutes(fastify: FastifyInstance) {
  fastify.post(
    '',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Create Customer',
        description:
          'Creates a new customer in the auto repair shop system. Requires customer name, document (CPF/CNPJ), email address, and phone number. The document must be unique in the system.',
        tags: ['customer'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          description: 'Customer creation payload',
          properties: {
            name: {
              type: 'string',
              description: 'Full name of the customer',
              minLength: 2,
              maxLength: 100,
            },
            document: {
              type: 'string',
              description: 'Customer document number (CPF or CNPJ)',
              pattern: '^[0-9]{11}$|^[0-9]{14}$',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Customer email address',
            },
            phone: {
              type: 'string',
              nullable: true,
              description: 'Customer phone number with area code',
              pattern: '^\\+?[0-9]{10,15}$',
            },
          },
          required: ['name', 'document', 'email', 'phone'],
        },
        response: {
          201: {
            description: 'Customer created successfully',
            ...customerResponseSchema,
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
    buildRoute(makeCreateCustomerController())
  );
  fastify.get(
    '',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'List Customers',
        description:
          'Retrieves a paginated list of customers with optional filtering and sorting. Supports filtering by name, document, email, and phone number.',
        tags: ['customer'],
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
                items: customerResponseSchema,
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
    buildRoute(makeGetAllCustomersController())
  );
  fastify.get(
    '/:document',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Get Customer by Document',
        description:
          'Retrieves a specific customer by their document number (CPF or CNPJ). Returns detailed customer information if found.',
        tags: ['customer'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            document: {
              type: 'string',
              description: 'Customer document number (CPF: 11 digits or CNPJ: 14 digits)',
              pattern: '^[0-9]{11}$|^[0-9]{14}$',
            },
          },
          required: ['document'],
        },
        response: {
          200: {
            description: 'Customer retrieved successfully',
            ...customerResponseSchema,
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
    buildRoute(makeGetCustomerByDocumentController())
  );
  fastify.patch(
    '/:document',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Update Customer',
        description:
          "Updates an existing customer's information. All fields are optional - only provided fields will be updated. The document in the URL identifies the customer to update.",
        tags: ['customer'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            document: {
              type: 'string',
              description: 'Current customer document number to identify the customer',
              pattern: '^[0-9]{11}$|^[0-9]{14}$',
            },
          },
          required: ['document'],
        },
        body: {
          type: 'object',
          description: 'Customer update payload (all fields optional)',
          properties: {
            name: {
              type: 'string',
              description: 'Updated customer name',
              minLength: 2,
              maxLength: 100,
            },
            document: {
              type: 'string',
              description: 'New document number (if changing)',
              pattern: '^[0-9]{11}$|^[0-9]{14}$',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Updated email address',
            },
            phone: {
              type: 'string',
              nullable: true,
              description: 'Updated phone number',
              pattern: '^\\+?[0-9]{10,15}$',
            },
          },
        },
        response: {
          200: {
            description: 'Customer updated successfully',
            ...customerResponseSchema,
          },
          400: {
            description: 'Bad Request',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          404: {
            description: 'Customer not found',
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
    buildRoute(makeUpdateCustomerController())
  );
  fastify.delete(
    '/:document',
    {
      preHandler: authMiddleware,
      schema: {
        summary: 'Delete Customer',
        description:
          'Permanently deletes a customer from the system. This action cannot be undone. All associated data (vehicles, work orders) may also be affected.',
        tags: ['customer'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          description: 'Path parameters',
          properties: {
            document: {
              type: 'string',
              description: 'Document number of the customer to delete',
              pattern: '^[0-9]{11}$|^[0-9]{14}$',
            },
          },
          required: ['document'],
        },
        response: {
          204: {
            description: 'Customer deleted successfully',
          },
          404: {
            description: 'Customer not found',
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
    buildRoute(makeDeleteCustomerController())
  );
}
