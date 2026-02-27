import { serviceResponseSchema } from '@/main/docs';

export const serviceMetricsResponseSchema = {
  type: 'object',
  properties: {
    averageExecutionTimeInMinutes: { type: 'number' },
    service: { ...serviceResponseSchema },
  },
};
