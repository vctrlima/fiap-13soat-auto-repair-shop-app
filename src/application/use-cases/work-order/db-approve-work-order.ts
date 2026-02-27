import { UpdateWorkOrderRepository } from '@/application/protocols/db';
import { SendEmailTransporter } from '@/application/protocols/messaging';
import { Status } from '@/domain/enums';
import { ApproveWorkOrder } from '@/domain/use-cases';
import env from '@/main/config/env';
import { notificationTemplate } from '@/main/templates';

export class DbApproveWorkOrder implements ApproveWorkOrder {
  constructor(
    private readonly updateWorkOrderRepository: UpdateWorkOrderRepository,
    private readonly sendEmailTransporter: SendEmailTransporter
  ) {}

  async approve(params: ApproveWorkOrder.Params): Promise<ApproveWorkOrder.Result> {
    const workOrder = await this.updateWorkOrderRepository.update({ id: params.id, status: Status.Approved });
    if (env.mailing.enabled) {
      await this.sendEmailTransporter.send({
        to: workOrder.customer.email,
        from: 'no-reply@auto-repair-shop.com',
        subject: 'Your service order has been approved!',
        html: notificationTemplate.update(workOrder, `${env.host}/api/work-orders/${workOrder.id}`),
      });
    }
    return workOrder;
  }
}
