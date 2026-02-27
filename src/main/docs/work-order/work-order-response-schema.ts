export const workOrderResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    customer: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        document: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string', nullable: true },
        vehicles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              licensePlate: { type: 'string' },
              brand: { type: 'string' },
              model: { type: 'string' },
              year: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time', nullable: true },
            },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time', nullable: true },
      },
    },
    vehicle: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        customer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            document: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        licensePlate: { type: 'string' },
        brand: { type: 'string' },
        model: { type: 'string' },
        year: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time', nullable: true },
      },
    },
    services: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          price: { type: 'number', minimum: 0 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
    },
    partsAndSupplies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          price: { type: 'number', minimum: 0 },
          inStock: { type: 'number', minimum: 0 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
    },
    status: {
      type: 'string',
      enum: [
        'RECEIVED',
        'IN_DIAGNOSIS',
        'WAITING_APPROVAL',
        'APPROVED',
        'IN_EXECUTION',
        'FINISHED',
        'DELIVERED',
        'CANCELED',
      ],
    },
    budget: { type: 'number', minimum: 0 },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
  },
};
