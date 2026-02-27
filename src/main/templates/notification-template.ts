import { CreateWorkOrder, UpdateWorkOrder } from '@/domain/use-cases';

export const notificationTemplate = {
  create: (data: CreateWorkOrder.Result, url: string) => baseTemplate(data, url, 'created'),
  update: (data: UpdateWorkOrder.Result, url: string) => baseTemplate(data, url, 'updated'),
  approvalRequest: (data: UpdateWorkOrder.Result, url: string) => baseTemplate(data, url, 'approval-request'),
};

const baseTemplate = (
  data: UpdateWorkOrder.Result,
  url: string,
  action: 'created' | 'updated' | 'approval-request'
) => {
  const isCreated = action === 'created';
  const isApprovalRequest = action === 'approval-request';
  const approveUrl = `${url}/approve`;
  const cancelUrl = `${url}/cancel`;

  const approveAndCancelButtons = `
    <div style="text-align: center; margin: 32px 0">
      <a
        href="${approveUrl}"
        target="_blank"
        rel="noopener noreferrer"
        style="
          display: inline-block;
          padding: 14px 28px;
          background-color: #198754;
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          letter-spacing: 0.2px;
          box-shadow: 0 4px 10px rgba(25, 135, 84, 0.25);
          margin-right: 12px;
        "
      >
        Approve
      </a>
      <a
        href="${cancelUrl}"
        target="_blank"
        rel="noopener noreferrer"
        style="
          display: inline-block;
          padding: 14px 28px;
          background-color: #dc3545;
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          letter-spacing: 0.2px;
          box-shadow: 0 4px 10px rgba(220, 53, 69, 0.25);
        "
      >
        Cancel
      </a>
    </div>
  `;
  const viewButton = `
    <div style="text-align: center; margin: 32px 0">
      <a
        href="${url}"
        target="_blank"
        rel="noopener noreferrer"
        style="
          display: inline-block;
          padding: 14px 28px;
          background-color: #0d6efd;
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          letter-spacing: 0.2px;
          box-shadow: 0 4px 10px rgba(13, 110, 253, 0.25);
        "
      >
        View Service Order
      </a>
    </div>
  `;

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f5f7fa;
      font-family: 'Poppins', Arial, Helvetica, sans-serif;
      color: #333333;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
      "
    >
      <tr>
        <td
          style="
            background: linear-gradient(90deg, #0d6efd, #6610f2);
            padding: 36px 20px;
            text-align: center;
            color: #ffffff;
          "
        >
          <h1
            style="
              margin: 0;
              font-size: 30px;
              font-weight: 600;
              letter-spacing: 0.3px;
            "
          >
            13SOAT | Auto Repair Shop
          </h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 32px 28px 24px 28px; text-align: left">
          <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.75">
            Hello, ${data.customer.name}
          </p>
          ${
            isCreated
              ? `
                <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.75">
                  Your service order has been <strong>created</strong>.
                  You can track the progress by clicking the button below:
                </p>
                ${viewButton}
              `
              : isApprovalRequest
              ? `
                <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.75">
                  Your service order is ready for review and <strong>waiting for your approval</strong>.
                  Please review the proposed budget below and choose whether to approve or cancel the order.
                </p>
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.75">
                  <strong>Estimated Budget:</strong> $${data.budget?.toFixed(2) || '0.00'}
                </p>
                ${approveAndCancelButtons}
              `
              : `
                <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.75">
                  We wanted to let you know that your service order has been ${action}.
                  You can view the details and track the progress by clicking
                  the button below:
                </p>
                ${viewButton}
              `
          }
          <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.6">
            If the button doesn’t work, copy and paste this link into your
            browser:<br />
            <a
              href="${url}"
              style="color: #0d6efd; text-decoration: none"
            >
              ${url}
            </a>
          </p>
          <p style="margin-top: 28px; font-size: 13px; color: #888">
            Thank you for choosing our services.<br />
            — The Service Team
          </p>
        </td>
      </tr>
      <tr>
        <td
          style="
            background-color: #f9fafc;
            padding: 16px 24px;
            text-align: center;
            color: #888;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            line-height: 1.5;
          "
        >
          This is an automated message. Please do not reply.<br /><br />
          <em style="font-size: 11px; color: #999;">
            * The links in this email are for illustrative purposes only and would normally redirect to a frontend interface.  
            Since these actions use POST requests, they will not work if opened directly in a new tab.
          </em>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
