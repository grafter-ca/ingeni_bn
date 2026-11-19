import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailDispatchResult {
  success: boolean;
  messageId: string | null;
  reason?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'true',
      },
    });
  }

  /**
   * Core execution method to dispatch raw mail payloads
   */
  async sendMail(to: string, subject: string, htmlContent: string): Promise<EmailDispatchResult> {
    if (!to || !to.trim()) {
      this.logger.warn(`Skipped email ("${subject}"): missing recipient email address.`);
      return { success: false, messageId: null, reason: 'Missing recipient email address' };
    }

    const cleanRecipient = to.trim();
    const mailOptions = {
      from: `"Ingeri Store Support" <${process.env.SMTP_USER}>`,
      to: cleanRecipient,
      subject,
      html: htmlContent,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email accepted by SMTP | to=${cleanRecipient} | subject="${subject}" | messageId=${info.messageId}`,
      );
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      this.logger.error(
        `Email failed | to=${cleanRecipient} | subject="${subject}" | error=${error.message}`,
      );
      throw new InternalServerErrorException(`Email pipeline breakdown: ${error.message}`);
    }
  }

  // --- EMAIL TEMPLATE: VENDOR PROFILE / STORE UPDATE ALERT ---
  async sendVendorProfileUpdateAlert(
    vendorEmail: string,
    recipientName: string,
    storeName: string,
    updatedFields: string[],
  ): Promise<EmailDispatchResult> {
    const subject = `🔄 Store & Profile Information Updated: ${storeName}`;
    const fieldsList =
      updatedFields.length > 0
        ? `<p><strong>Updated fields:</strong> ${updatedFields.join(', ')}</p>`
        : '';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2563EB; margin-top: 0;">Store Profile Updated</h2>
        <p>Hello ${recipientName},</p>
        <p>Your vendor profile and store details for <strong>${storeName}</strong> have been updated.</p>
        ${fieldsList}
        <p style="font-size: 13px; color: #4B5563;">If you did not request or authorize these changes, please contact support immediately.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <footer style="font-size: 12px; color: #777777;">
          Automated notification from Ingeri Store Systems.
        </footer>
      </div>
    `;
    return this.sendMail(vendorEmail, subject, html);
  }

  // --- EMAIL TEMPLATE: PRODUCT CREATION CONFIRMATION ---
  async sendProductCreationAlert(vendorEmail: string, vendorName: string, productTitle: string) {
    const subject = `🚀 Product Published Successfully: ${productTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #4F46E5;">Hello ${vendorName},</h2>
        <p>Congratulations! Your new marketplace listing, <strong>${productTitle}</strong>, is now live on the platform catalog repository.</p>
        <p style="margin-top: 20px;">Our catalog quality assurance team will evaluate your upload parameters shortly to optimize its organic listing metrics.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <footer style="font-size: 12px; color: #777777;">
          This is an automated operational notification for Ingeri Store Vendors. Please do not reply directly.
        </footer>
      </div>
    `;
    return this.sendMail(vendorEmail, subject, html);
  }

  // --- EMAIL TEMPLATE: PRODUCT MODIFICATION NOTIFICATION ---
  async sendProductUpdateAlert(vendorEmail: string, vendorName: string, productTitle: string) {
    const subject = `🔄 Listing Profile Modified: ${productTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2563EB;">Listing Update Confirmation</h2>
        <p>Dear ${vendorName},</p>
        <p>This message confirms a successful profile change was saved to your item: <strong>${productTitle}</strong>.</p>
        <p>If you did not authorize this change, please lock your operational console interface and contact support immediately.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <footer style="font-size: 12px; color: #777777;">
          Security logging notification from Ingeri Store Systems.
        </footer>
      </div>
    `;
    return this.sendMail(vendorEmail, subject, html);
  }

  // --- EMAIL TEMPLATE: VENDOR SECURITY INCIDENT DESK ---
  async sendSecurityIssueRequest(vendorEmail: string, storeName: string, issueDetails: string) {
    const systemAdminEmail = process.env.SMTP_USER as string;
    const subject = `⚠️ CRITICAL: Security Issue Flagged by Vendor [${storeName}]`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #DC2626; padding: 20px; border-radius: 8px;">
        <h2 style="color: #DC2626; margin-top: 0;">Urgent Security Resolution Required</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 30%;">Vendor Profile:</td>
            <td style="padding: 6px 0;">${storeName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Contact Email:</td>
            <td style="padding: 6px 0;">${vendorEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Timestamp:</td>
            <td style="padding: 6px 0;">${new Date().toISOString()}</td>
          </tr>
        </table>
        <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #991B1B;">Vendor Statement Report:</h4>
          <p style="margin: 0; font-family: monospace; white-space: pre-wrap; color: #7F1D1D;">${issueDetails}</p>
        </div>
        <p style="margin-top: 20px; font-size: 13px; color: #4B5563;">
          Please examine the active firewall configuration and session logs associated with this vendor immediately.
        </p>
      </div>
    `;
    return this.sendMail(systemAdminEmail, subject, html);
  }

  // --- EMAIL TEMPLATE: VENDOR ONBOARDING REQUEST ---
  async sendVendorOnboardingRequest(userName: string, userEmail: string, businessDescription: string) {
    const adminEmail = process.env.SMTP_USER as string;
    const subject = `🆕 New Vendor Onboarding Request: ${userName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #d1d5db; border-radius: 8px;">
        <h2 style="color: #059669;">New Vendor Application</h2>
        <p>A user has requested to join as a vendor on the Ingeri Store platform.</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Business Context:</strong><br>${businessDescription}</p>
        </div>
        <p style="margin-top: 20px;">
          <a href="${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:5173/admin/vendors'}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review in Admin Panel</a>
        </p>
      </div>
    `;
    return this.sendMail(adminEmail, subject, html);
  }

  async sendOrderConfirmationEmail(
    to: string,
    customerName: string,
    orderNumber: string,
    totalAmount: number,
    items: Array<{ title?: string; quantity: number; priceAtPurchase: number }>,
  ): Promise<EmailDispatchResult> {
    const subject = `🧾 Order Confirmed: ${orderNumber}`;
    const rows = items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 6px 8px; border-bottom: 1px solid #eee;">${item.title || 'Item'}</td>
            <td style="padding: 6px 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 6px 8px; border-bottom: 1px solid #eee; text-align: right;">RWF ${(Number(item.priceAtPurchase) * Number(item.quantity)).toLocaleString()}</td>
          </tr>`,
      )
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
        <h2 style="color: #059669; margin-top: 0;">Order Placed Successfully</h2>
        <p>Hello ${customerName},</p>
        <p>We have received your order <strong>${orderNumber}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <thead>
            <tr style="background: #f9fafb; text-align: left;">
              <th style="padding: 8px;">Product</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="font-size: 15px;"><strong>Total: RWF ${Number(totalAmount).toLocaleString()}</strong></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <footer style="font-size: 12px; color: #6b7280;">Ingeri Store Order Tracking</footer>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendOrderTrackingUpdateEmail(
    to: string,
    customerName: string,
    orderNumber: string,
    status: string,
    paymentStatus?: string,
  ): Promise<EmailDispatchResult> {
    const subject = `📦 Order ${orderNumber} Status: ${status}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2563EB; margin-top: 0;">Order Tracking Update</h2>
        <p>Hello ${customerName},</p>
        <p>Your order <strong>${orderNumber}</strong> has been updated.</p>
        <p><strong>Fulfillment Status:</strong> ${status}</p>
        ${paymentStatus ? `<p><strong>Payment Status:</strong> ${paymentStatus}</p>` : ''}
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <footer style="font-size: 12px; color: #6b7280;">Ingeri Store Order Tracking</footer>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendPaymentUpdateEmail(
    to: string,
    customerName: string,
    orderNumber: string,
    paymentStatus: string,
    note?: string,
  ): Promise<EmailDispatchResult> {
    const subject = `💳 Payment Update for Order ${orderNumber}: ${paymentStatus}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
        <h2 style="color: #4F46E5; margin-top: 0;">Payment Status Update</h2>
        <p>Hello ${customerName},</p>
        <p>The payment status for order <strong>${orderNumber}</strong> is now <strong>${paymentStatus}</strong>.</p>
        ${note ? `<p>${note}</p>` : ''}
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <footer style="font-size: 12px; color: #6b7280;">Ingeri Store Billing & Order Tracking</footer>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }
}