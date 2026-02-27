/*
  Warnings:

  - You are about to drop the column `userId` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleId` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `partOrSupplyId` on the `WorkOrderPartOrSupply` table. All the data in the column will be lost.
  - You are about to drop the column `workOrderId` on the `WorkOrderPartOrSupply` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `WorkOrderService` table. All the data in the column will be lost.
  - You are about to drop the column `workOrderId` on the `WorkOrderService` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[work_order_id,part_or_supply_id]` on the table `WorkOrderPartOrSupply` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[work_order_id,service_id]` on the table `WorkOrderService` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_id` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_id` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle_id` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `part_or_supply_id` to the `WorkOrderPartOrSupply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work_order_id` to the `WorkOrderPartOrSupply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_id` to the `WorkOrderService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work_order_id` to the `WorkOrderService` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vehicle" DROP CONSTRAINT "Vehicle_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkOrder" DROP CONSTRAINT "WorkOrder_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkOrder" DROP CONSTRAINT "WorkOrder_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkOrderPartOrSupply" DROP CONSTRAINT "WorkOrderPartOrSupply_partOrSupplyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkOrderPartOrSupply" DROP CONSTRAINT "WorkOrderPartOrSupply_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkOrderService" DROP CONSTRAINT "WorkOrderService_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkOrderService" DROP CONSTRAINT "WorkOrderService_workOrderId_fkey";

-- DropIndex
DROP INDEX "public"."RefreshToken_userId_idx";

-- DropIndex
DROP INDEX "public"."work_order_part_or_supply_unique";

-- DropIndex
DROP INDEX "public"."work_order_service_unique";

-- AlterTable
ALTER TABLE "public"."RefreshToken" DROP COLUMN "userId",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."Vehicle" DROP COLUMN "customerId",
ADD COLUMN     "customer_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."WorkOrder" DROP COLUMN "customerId",
DROP COLUMN "vehicleId",
ADD COLUMN     "customer_id" UUID NOT NULL,
ADD COLUMN     "vehicle_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."WorkOrderPartOrSupply" DROP COLUMN "partOrSupplyId",
DROP COLUMN "workOrderId",
ADD COLUMN     "part_or_supply_id" UUID NOT NULL,
ADD COLUMN     "work_order_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."WorkOrderService" DROP COLUMN "serviceId",
DROP COLUMN "workOrderId",
ADD COLUMN     "service_id" UUID NOT NULL,
ADD COLUMN     "work_order_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "RefreshToken_user_id_idx" ON "public"."RefreshToken"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_part_or_supply_unique" ON "public"."WorkOrderPartOrSupply"("work_order_id", "part_or_supply_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_service_unique" ON "public"."WorkOrderService"("work_order_id", "service_id");

-- AddForeignKey
ALTER TABLE "public"."Vehicle" ADD CONSTRAINT "Vehicle_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrder" ADD CONSTRAINT "WorkOrder_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrder" ADD CONSTRAINT "WorkOrder_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderPartOrSupply" ADD CONSTRAINT "WorkOrderPartOrSupply_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "public"."WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderPartOrSupply" ADD CONSTRAINT "WorkOrderPartOrSupply_part_or_supply_id_fkey" FOREIGN KEY ("part_or_supply_id") REFERENCES "public"."PartOrSupply"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderService" ADD CONSTRAINT "WorkOrderService_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "public"."WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkOrderService" ADD CONSTRAINT "WorkOrderService_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
