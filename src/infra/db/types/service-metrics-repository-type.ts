export interface ServiceMetricsRepositoryType {
  ServiceMetrics: MetricDateRange[];
  createdAt: Date;
  id: string;
  name: string;
  description: string | null;
  price: number;
  updatedAt: Date | null;
}

export interface MetricDateRange {
  startedAt: Date;
  finishedAt: Date | null;
}
