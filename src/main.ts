// OpenTelemetry must be imported BEFORE any other module
import './infra/observability/tracing';

import 'tsconfig-paths/register';
import 'module-alias/register';

import Fastify from 'fastify';
import { app } from './main/config/app';
import {
  httpRequestCounter,
  httpRequestDuration,
  getRequestContext,
  correlationFields,
} from './infra/observability';

const host = process.env.HOST ?? 'localhost';
const port = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 3000;

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          hostname: request.hostname,
          remoteAddress: request.ip,
        };
      },
    },
  },
  requestIdHeader: 'x-request-id',
  genReqId: () => require('crypto').randomUUID(),
});

// Request lifecycle hooks for metrics and correlation
server.addHook('onRequest', async (request) => {
  const ctx = getRequestContext(request.id as string);
  request.log = request.log.child(correlationFields(ctx));
  (request as any).__startTime = process.hrtime.bigint();
});

server.addHook('onResponse', async (request, reply) => {
  const startTime = (request as any).__startTime as bigint | undefined;
  const durationMs = startTime ? Number(process.hrtime.bigint() - startTime) / 1_000_000 : 0;

  const attributes = {
    'http.method': request.method,
    'http.route': request.routeOptions?.url || request.url,
    'http.status_code': reply.statusCode,
  };

  httpRequestCounter.add(1, attributes);
  httpRequestDuration.record(durationMs, attributes);
});

server.register(app);

server.listen({ port, host }, (error) => {
  if (error) {
    server.log.error(error);
    process.exit(1);
  } else {
    console.log(`[READY] http://${host}:${port}`);
  }
});
