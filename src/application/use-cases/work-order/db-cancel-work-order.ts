import { UpdateWorkOrderRepository } from '@/application/protocols/db';
import { SendEmailTransporter } from '@/application/protocols/messaging';
import { Status } from '@/domain/enums';
import { CancelWorkOrder } from '@/domain/use-cases';
import env from '@/main/config/env';
import { notificationTemplate } from '@/main/templates';

export class DbCancelWorkOrder implements CancelWorkOrder {
  constructor(
    private readonly updateWorkOrderRepository: UpdateWorkOrderRepository,
    private readonly sendEmailTransporter: SendEmailTransporter
  ) {}

  async cancel(params: CancelWorkOrder.Params): Promise<CancelWorkOrder.Result> {
    const workOrder = await this.updateWorkOrderRepository.update({ id: params.id, status: Status.Canceled });
    if (env.mailing.enabled) {
      await this.sendEmailTransporter.send({
        to: workOrder.customer.email,
        from: 'no-reply@auto-repair-shop.com',
        subject: 'Your service order has been canceled...',
        html: notificationTemplate.update(workOrder, `${env.host}/api/work-orders/${workOrder.id}`),
      });
    }
    return workOrder;
  }
}
