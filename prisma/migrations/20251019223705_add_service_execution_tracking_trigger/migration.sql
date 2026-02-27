-- Add trigger to track service execution time in ServiceMetrics table
CREATE OR REPLACE FUNCTION track_service_execution_time()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'IN_EXECUTION') THEN
    INSERT INTO "public"."ServiceMetrics" ("id", "work_order_id", "service_id", "started_at")
    SELECT
      gen_random_uuid(),
      wos."work_order_id",
      wos."service_id",
      NOW()
    FROM "public"."WorkOrderService" wos
    WHERE wos."work_order_id" = NEW."id"
      AND NOT EXISTS (
        SELECT 1
        FROM "public"."ServiceMetrics" setr
        WHERE setr."work_order_id" = wos."work_order_id"
          AND setr."service_id" = wos."service_id"
      );

  ELSIF (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'FINISHED') THEN
    UPDATE "public"."ServiceMetrics" setr
    SET "finished_at" = NOW()
    WHERE setr."work_order_id" = NEW."id"
      AND setr."finished_at" IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_service_metrics ON "public"."WorkOrder";

CREATE TRIGGER trg_service_metrics
AFTER UPDATE OF "status"
ON "public"."WorkOrder"
FOR EACH ROW
EXECUTE FUNCTION track_service_execution_time();
