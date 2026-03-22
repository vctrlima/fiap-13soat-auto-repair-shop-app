import { UpdateWorkOrderRepository } from "@/application/protocols/db";
import { SendEmailTransporter } from "@/application/protocols/messaging";
import { Status } from "@/domain/enums";
import { UpdateWorkOrder } from "@/domain/use-cases";
import { workOrderCompletedCounter } from "@/infra/observability";
import env from "@/main/config/env";
import { notificationTemplate } from "@/main/templates";

export class DbUpdateWorkOrder implements UpdateWorkOrder {
  constructor(
    private readonly updateWorkOrderRepository: UpdateWorkOrderRepository,
    private readonly sendEmailTransporter: SendEmailTransporter,
  ) {}

  async update(
    params: UpdateWorkOrder.Params,
  ): Promise<UpdateWorkOrder.Result> {
    const result = await this.updateWorkOrderRepository.update(params);
    if (
      result.status === Status.Finished ||
      result.status === Status.Delivered
    ) {
      workOrderCompletedCounter.add(1, {
        "work_order.status": result.status.toLowerCase(),
      });
    }
    if (!env.mailing.enabled) return result;
    if (result.status === Status.WaitingApproval) {
      await this.sendEmailTransporter.send({
        to: result.customer.email,
        from: "no-reply@auto-repair-shop.com",
        subject: "Your service order is waiting for approval!",
        html: notificationTemplate.approvalRequest(
          result,
          `${env.host}/api/work-orders/${result.id}`,
        ),
      });
    } else {
      await this.sendEmailTransporter.send({
        to: result.customer.email,
        from: "no-reply@auto-repair-shop.com",
        subject: "Your service order has been updated!",
        html: notificationTemplate.update(
          result,
          `${env.host}/api/work-orders/${result.id}`,
        ),
      });
    }
    return result;
  }
}
