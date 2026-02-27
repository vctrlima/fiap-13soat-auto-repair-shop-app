import { FastifyDynamicSwaggerOptions } from '@fastify/swagger';

export const docs: FastifyDynamicSwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'FIAP: Software Architecture | Auto Repair Shop',
      description: 'API documentation for Auto Repair Shop project',
      summary: 'API documentation for Auto Repair Shop project',
      version: '0.1.0',
      contact: {
        name: 'Victor Lima',
        url: 'https://github.com/vctrlima',
        email: 'victor.limac@icloud.com',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Current server',
      },
    ],
    tags: [
      { name: 'auth', description: 'Authentication related end-points' },
      { name: 'customer', description: 'Customer related end-points' },
      { name: 'part-or-supply', description: 'Part or supply related end-points' },
      { name: 'service', description: 'Service related end-points' },
      { name: 'user', description: 'User related end-points' },
      { name: 'vehicle', description: 'Vehicle related end-points' },
      { name: 'work-order', description: 'Work order related end-points' },
    ],
    externalDocs: {
      url: 'https://www.notion.so/vctrlima/13SOAT-Fase-1-Tech-Challenge-26e2213e4fde805988b4e3caa7defa63',
      description: 'Find more info exploring the project wiki on Notion',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Bearer token for authentication',
        },
      },
    },
  },
};
