import { DbCancelWorkOrder } from '@/application/use-cases';
import { CancelWorkOrder } from '@/domain/use-cases';
import { PrismaWorkOrderRepository, prisma } from '@/infra/db';
import { NodeMailerAdapter } from '@/infra/messaging';
import env from '@/main/config/env';
import { createTransport } from 'nodemailer';

export const makeCancelWorkOrder = (): CancelWorkOrder => {
  const prismaWorkOrderRepository = new PrismaWorkOrderRepository(prisma);
  const transporter = createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    auth: { user: env.smtp.username, pass: env.smtp.password },
  });
  const nodemailerAdapter = new NodeMailerAdapter(transporter);
  return new DbCancelWorkOrder(prismaWorkOrderRepository, nodemailerAdapter);
};
