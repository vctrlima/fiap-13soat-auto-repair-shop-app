import {
  authRoutes,
  customerRoutes,
  partOrSupplyRoutes,
  serviceMetricsRoutes,
  serviceRoutes,
  userRoutes,
  vehicleRoutes,
  workOrderRoutes,
} from '@/main/routes';
import AutoLoad from '@fastify/autoload';
import cors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';
import * as path from 'path';
import { docs } from './docs';

export type AppOptions = object;

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  /* Plugins */
  fastify.register(fastifySwagger, docs);
  fastify.register(AutoLoad, { dir: path.join(__dirname, '../plugins'), options: { ...opts } });
  fastify.register(cors, { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] });

  /* API routes */
  fastify.register(authRoutes, { prefix: '/api/auth' });
  fastify.register(customerRoutes, { prefix: '/api/customers' });
  fastify.register(partOrSupplyRoutes, { prefix: '/api/parts-or-supplies' });
  fastify.register(serviceRoutes, { prefix: '/api/services' });
  fastify.register(userRoutes, { prefix: '/api/users' });
  fastify.register(vehicleRoutes, { prefix: '/api/vehicles' });
  fastify.register(workOrderRoutes, { prefix: '/api/work-orders' });
  fastify.register(serviceMetricsRoutes, { prefix: '/api/metrics' });

  /* Health check route */
  fastify.get('/health', async () => {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };
  });

  /* Swagger documentation */
  fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'full', deepLinking: false },
  });
}
