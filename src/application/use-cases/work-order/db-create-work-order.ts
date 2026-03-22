import { CreateWorkOrderRepository } from "@/application/protocols/db";
import { SendEmailTransporter } from "@/application/protocols/messaging";
import { CreateWorkOrder } from "@/domain/use-cases";
import { workOrderCreatedCounter } from "@/infra/observability";
import env from "@/main/config/env";
import { notificationTemplate } from "@/main/templates";

export class DbCreateWorkOrder implements CreateWorkOrder {
  constructor(
    private readonly createWorkOrderRepository: CreateWorkOrderRepository,
    private readonly sendEmailTransporter: SendEmailTransporter,
  ) {}

  async create(
    params: CreateWorkOrder.Params,
  ): Promise<CreateWorkOrder.Result> {
    const result = await this.createWorkOrderRepository.create(params);
    workOrderCreatedCounter.add(1);
    if (env.mailing.enabled) {
      await this.sendEmailTransporter.send({
        to: result.customer.email,
        from: "no-reply@auto-repair-shop.com",
        subject: "Your service order has been created!",
        html: notificationTemplate.create(
          result,
          `${env.host}/api/work-orders/${result.id}`,
        ),
      });
    }
    return result;
  }
}
