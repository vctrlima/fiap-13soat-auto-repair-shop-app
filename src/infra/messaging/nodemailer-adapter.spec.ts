import { SendEmailTransporter } from '@/application/protocols/messaging';
import { faker } from '@faker-js/faker';
import { Transporter } from 'nodemailer';
import { NodeMailerAdapter } from './nodemailer-adapter';

describe('NodeMailerAdapter', () => {
  let transporterMock: jest.Mocked<Transporter>;
  let nodeMailerAdapter: NodeMailerAdapter;

  beforeEach(() => {
    transporterMock = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Transporter>;
    nodeMailerAdapter = new NodeMailerAdapter(transporterMock);
  });

  it('should call transporter.sendMail with correct data', async () => {
    const emailData: SendEmailTransporter.Params = {
      from: faker.internet.email(),
      to: faker.internet.email(),
      subject: faker.lorem.sentence(),
      html: faker.lorem.paragraph(),
    };

    await nodeMailerAdapter.send(emailData);

    expect(transporterMock.sendMail).toHaveBeenCalledWith(emailData);
  });

  it('should throw if transporter.sendMail throws', async () => {
    transporterMock.sendMail.mockRejectedValueOnce(new Error('Test Error'));

    const emailData: SendEmailTransporter.Params = {
      from: faker.internet.email(),
      to: faker.internet.email(),
      subject: faker.lorem.sentence(),
      html: faker.lorem.paragraph(),
    };

    await expect(nodeMailerAdapter.send(emailData)).rejects.toThrow('Test Error');
  });
});
