import { UpdateWorkOrderRepository } from '@/application/protocols/db';
import { SendEmailTransporter } from '@/application/protocols/messaging';
import { Status } from '@/domain/enums';
import { ApproveWorkOrder } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbApproveWorkOrder } from './db-approve-work-order';

jest.mock('@/main/config/env', () => ({
  host: 'http://localhost:3000',
  mailing: { enabled: true },
}));

jest.mock('@/main/templates', () => ({
  notificationTemplate: {
    update: jest.fn().mockReturnValue('<html>Mocked template</html>'),
  },
}));

describe('DbApproveWorkOrder', () => {
  let updateWorkOrderRepository: jest.Mocked<UpdateWorkOrderRepository>;
  let sendEmailTransporter: jest.Mocked<SendEmailTransporter>;
  let sut: DbApproveWorkOrder;

  const mockWorkOrderResult = {
    id: faker.string.uuid(),
    status: Status.Approved,
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
    sut = new DbApproveWorkOrder(updateWorkOrderRepository, sendEmailTransporter);
  });

  describe('approve()', () => {
    it('should update work order status to approved', async () => {
      const params: ApproveWorkOrder.Params = { id: faker.string.uuid() };
      updateWorkOrderRepository.update.mockResolvedValue(mockWorkOrderResult as any);
      sendEmailTransporter.send.mockResolvedValue(undefined);

      await sut.approve(params);

      expect(updateWorkOrderRepository.update).toHaveBeenCalledWith({
        id: params.id,
        status: Status.Approved,
      });
    });

    it('should send email notification to customer', async () => {
      const params: ApproveWorkOrder.Params = { id: faker.string.uuid() };
      updateWorkOrderRepository.update.mockResolvedValue(mockWorkOrderResult as any);
      sendEmailTransporter.send.mockResolvedValue(undefined);

      await sut.approve(params);

      expect(sendEmailTransporter.send).toHaveBeenCalledWith({
        to: 'customer@example.com',
        from: 'no-reply@auto-repair-shop.com',
        subject: 'Your service order has been approved!',
        html: '<html>Mocked template</html>',
      });
    });

    it('should call notification template with correct parameters', async () => {
      const params: ApproveWorkOrder.Params = { id: faker.string.uuid() };
      updateWorkOrderRepository.update.mockResolvedValue(mockWorkOrderResult as any);
      sendEmailTransporter.send.mockResolvedValue(undefined);
      const { notificationTemplate } = require('@/main/templates');

      await sut.approve(params);

      expect(notificationTemplate.update).toHaveBeenCalledWith(
        mockWorkOrderResult,
        `http://localhost:3000/api/work-orders/${mockWorkOrderResult.id}`
      );
    });

    it('should return the updated work order result', async () => {
      const params: ApproveWorkOrder.Params = { id: faker.string.uuid() };
      updateWorkOrderRepository.update.mockResolvedValue(mockWorkOrderResult as any);
      sendEmailTransporter.send.mockResolvedValue(undefined);

      const result = await sut.approve(params);

      expect(result).toEqual(mockWorkOrderResult);
    });

    it('should throw error if repository update fails', async () => {
      const params: ApproveWorkOrder.Params = { id: faker.string.uuid() };
      const error = new Error('Repository error');
      updateWorkOrderRepository.update.mockRejectedValue(error);

      await expect(sut.approve(params)).rejects.toThrow('Repository error');
      expect(sendEmailTransporter.send).not.toHaveBeenCalled();
    });

    it('should throw error if email sending fails', async () => {
      const params: ApproveWorkOrder.Params = { id: faker.string.uuid() };
      updateWorkOrderRepository.update.mockResolvedValue(mockWorkOrderResult as any);
      const error = new Error('Email sending failed');
      sendEmailTransporter.send.mockRejectedValue(error);

      await expect(sut.approve(params)).rejects.toThrow('Email sending failed');
    });

    it('should not send email when mailing is disabled', async () => {
      const env = require('@/main/config/env');
      env.mailing.enabled = false;

      const params: ApproveWorkOrder.Params = { id: faker.string.uuid() };
      updateWorkOrderRepository.update.mockResolvedValue(mockWorkOrderResult as any);

      const result = await sut.approve(params);

      expect(sendEmailTransporter.send).not.toHaveBeenCalled();
      expect(result).toEqual(mockWorkOrderResult);

      env.mailing.enabled = true;
    });
  });
});
