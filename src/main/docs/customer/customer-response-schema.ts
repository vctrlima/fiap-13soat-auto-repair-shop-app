export const customerResponseSchema = {
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
};
