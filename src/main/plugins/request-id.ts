import fp from 'fastify-plugin';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

/**
 * Adds x-request-id to every response so clients can correlate requests
 * with traces in the observability stack.
 */
export default fp(async function requestIdPlugin(fastify: FastifyInstance) {
  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.header('x-request-id', request.id);
  });
});
