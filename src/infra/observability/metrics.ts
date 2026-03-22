import { Counter, Histogram, Meter, metrics } from "@opentelemetry/api";

const meter: Meter = metrics.getMeter("auto-repair-shop-api");

export const httpRequestCounter: Counter = meter.createCounter(
  "http.server.request.count",
  {
    description: "Total number of HTTP requests",
  },
);

export const httpRequestDuration: Histogram = meter.createHistogram(
  "http.request.duration",
  {
    description: "HTTP request duration in milliseconds",
    unit: "ms",
  },
);

export const workOrderCreatedCounter: Counter = meter.createCounter(
  "business.work_order.created",
  {
    description: "Total number of work orders created",
  },
);

export const workOrderCompletedCounter: Counter = meter.createCounter(
  "business.work_order.completed",
  {
    description: "Total number of work orders completed",
  },
);

export const authLoginCounter: Counter = meter.createCounter(
  "business.auth.login.count",
  {
    description: "Total number of login attempts",
  },
);

export const authLoginFailureCounter: Counter = meter.createCounter(
  "business.auth.login.failure",
  {
    description: "Total number of failed login attempts",
  },
);

export const customerCreatedCounter: Counter = meter.createCounter(
  "business.customer.created",
  {
    description: "Total number of customers created",
  },
);

export const dbQueryDuration: Histogram = meter.createHistogram(
  "db.query.duration",
  {
    description: "Database query duration in milliseconds",
    unit: "ms",
  },
);

export const dbQueryErrorCounter: Counter = meter.createCounter(
  "db.query.error.count",
  {
    description: "Total number of database query errors",
  },
);
