-- CreateTable
CREATE TABLE "public"."ServiceMetrics" (
    "id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "ServiceMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_metrics_started_at_idx" ON "public"."ServiceMetrics"("started_at");

-- CreateIndex
CREATE INDEX "service_metrics_finished_at_idx" ON "public"."ServiceMetrics"("finished_at");

-- CreateIndex
CREATE UNIQUE INDEX "service_metrics_unique" ON "public"."ServiceMetrics"("work_order_id", "service_id");

-- AddForeignKey
ALTER TABLE "public"."ServiceMetrics" ADD CONSTRAINT "ServiceMetrics_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "public"."WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceMetrics" ADD CONSTRAINT "ServiceMetrics_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
