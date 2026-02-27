import { context, SpanContext, trace } from '@opentelemetry/api';
import { randomUUID } from 'crypto';

export interface RequestContext {
  requestId: string;
  traceId: string;
  spanId: string;
}

/**
 * Extracts the current OpenTelemetry trace/span context and generates a request ID.
 * Use this to correlate logs with distributed traces.
 */
export function getRequestContext(incomingRequestId?: string): RequestContext {
  const activeSpan = trace.getSpan(context.active());
  const spanContext: SpanContext | undefined = activeSpan?.spanContext();

  return {
    requestId: incomingRequestId || randomUUID(),
    traceId: spanContext?.traceId || 'no-trace',
    spanId: spanContext?.spanId || 'no-span',
  };
}

/**
 * Builds structured log fields that should be included in every log line
 * for correlation with the observability stack.
 */
export function correlationFields(ctx: RequestContext): Record<string, string> {
  return {
    requestId: ctx.requestId,
    traceId: ctx.traceId,
    spanId: ctx.spanId,
  };
}
