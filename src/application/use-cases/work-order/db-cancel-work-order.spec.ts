import { UpdateWorkOrderRepository } from '@/application/protocols/db';
import { SendEmailTransporter } from '@/application/protocols/messaging';
import { Status } from '@/domain/enums';
import { CancelWorkOrder } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbCancelWorkOrder } from './db-cancel-work-order';

jest.mock('@/main/config/env', () => ({
  host: 'http://localhost:3000',
  mailing: { enabled: true },
}));

jest.mock('@/main/templates', () => ({
  notificationTemplate: {
    update: jest.fn().mockReturnValue('<html>Mocked template</html>'),
  },
}));

describe('DbCancelWorkOrder', () => {
  let updateWorkOrderRepository: jest.Mocked<UpdateWorkOrderRepository>;
  let sendEmailTransporter: jest.Mocked<SendEmailTransporter>;
  let sut: DbCancelWorkOrder;

  const mockWorkOrderResult = {
    id: faker.string.uuid(),
    status: Status.Canceled,
    customer: {
      email: 'customer@example.com',
      name: 'John Doe',
    },
  };

  beforeEach(() => {
    updateWorkOrderRepository = {
      update: jest.fn(),
    };
    sendEmailTransporter = {
      send: jest.fn(),
    };
    sut = new DbCancelWorkOrder(updateWorkOrderRepository, sendEmailTransporter);
  });

  describe('cancel()', () => {
    it('should update work order status to canceled', async () => {
      const params: CancelWorkOrder.Params = { id: faker.string.uuid() };
      updateWorkOrderRepository.update.mockResolvedValue(mockWorkOrderResult as any);
      sendEmailTransporter.send.mockResolvedValue(undefined);

      await sut.cancel(params);

      expect(updateWorkOrderRepository.update).toHaveBeenCalledWith({
        id: params.id,
        status: Status.Canceled,
      });
    });

    it('should send email notification to customer', async () => {
      const params: CancelWorkOrder.Params = { id: faker.string.uuid() };
      updateWorkOrderRepository.update.mockResolvedValue(mockWorkOrderResult as any);
      sendEmailTransporter.send.mockResolvedValue(undefined);

      await sut.cancel(params);

      expect(sendEmailTransporter.send).toHaveBeenCalledWith({
        to: 'customer@example.com',
        from: 'no-reply@auto-repair-shop.com',
        subject: 'Your service order has been canceled...',
        html: '<html>Mocked template</html>',
      });
    });

    it('should call notification template with correct parameters', async () => {
      const params: CancelWorkOrder.Params = { id: faker.string.uuid() };
      updateWorkOrderRepository.update.mockResolvedValue(mockWorkOrderResult as any);
      sendEmailTransporter.send.mockResolvedValue(undefined);
      const { notificationTemplate } = require('@/main/templates');

      await sut.cancel(params);

      expect(notificationTemplate.update).toHaveBeenCalledWith(
        mockWorkOrderResult,
        `http://localhost:3000/api/work-orders/${mockWorkOrderResult.id}`
      );
    });

    it('should return the updated work order result', async () => {
      const params: CancelWorkOrder.Params = { id: faker.string.uuid() };
      updateWorkOrderRepository.update.mockResolvedValue(mockWorkOrderResult as any);
      sendEmailTransporter.send.mockResolvedValue(undefined);

      const result = await sut.cancel(params);

      expect(result).toEqual(mockWorkOrderResult);
    });

    it('should throw error if repository update fails', async () => {
      const params: CancelWorkOrder.Params = { id: faker.string.uuid() };
      const error = new Error('Repository error');
      updateWorkOrderRepository.update.mockRejectedValue(error);

      await expect(sut.cancel(params)).rejects.toThrow('Repository error');
      expect(sendEmailTransporter.send).not.toHaveBeenCalled();
    });

    it('should throw error if email sending fails', async () => {
      const params: CancelWorkOrder.Params = { id: faker.string.uuid() };
      updateWorkOrderRepository.update.mockResolvedValue(mockWorkOrderResult as any);
      const error = new Error('Email sending failed');
      sendEmailTransporter.send.mockRejectedValue(error);

      await expect(sut.cancel(params)).rejects.toThrow('Email sending failed');
    });
  });
});
