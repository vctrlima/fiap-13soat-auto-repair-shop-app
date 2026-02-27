import { SendEmailTransporter } from '@/application/protocols/messaging';
import { Transporter } from 'nodemailer';

export class NodeMailerAdapter implements SendEmailTransporter {
  constructor(private readonly transporter: Transporter) {}

  async send(data: SendEmailTransporter.Params) {
    await this.transporter.sendMail({ ...data });
  }
}
