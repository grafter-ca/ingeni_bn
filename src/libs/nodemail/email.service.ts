import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailDispatchResult {
  success: boolean;
  messageId: string | null;
  reason?: string;
}

export interface NewProductAlertPayload {
  productTitle: string;
  productSlug: string;
  price: number;
  categoryName?: string;
  storeName?: string;
  location?: string | null;
}

export interface SubscriberRecipient {
  email?: string | null;
  name?: string | null;
  unsubscribeToken?: string | null;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const port = Number(process.env.SMTP_PORT || 587);
    const isSecure = process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === 'true'
      : port === 465;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: isSecure,
      requireTLS:
        process.env.SMTP_REQUIRE_TLS !== undefined
          ? process.env.SMTP_REQUIRE_TLS === 'true'
          : !isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 15000),
      tls: {
        rejectUnauthorized:
          process.env.SMTP_REJECT_UNAUTHORIZED !== undefined
            ? process.env.SMTP_REJECT_UNAUTHORIZED === 'true'
            : true,
      },
    });
  }

  private resolveApiBaseUrl(): string {
    const rawBase = (
      process.env.BETTER_AUTH_URL || 'http://localhost:8000'
    ).replace(/\/+$/, '');

    return rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;
  }

  private resolveFrontendBaseUrl(): string {
    const isProd = process.env.NODE_ENV === 'production';
    return (
      process.env.FRONTEND_URL ||
      process.env.VITE_FRONTEND_URL ||
      (isProd ? 'https://ingeni.onrender.com' : 'http://localhost:5173')
    ).replace(/\/+$/, '');
  }

  buildUnsubscribeUrl(token?: string | null): string {
    const base = this.resolveApiBaseUrl();
    if (!token || !token.trim()) {
      return `${base}/subscribers/unsubscribe`;
    }
    return `${base}/subscribers/unsubscribe?token=${encodeURIComponent(token.trim())}`;
  }

  /**
   * Core execution method to dispatch raw mail payloads via Nodemailer
   */
  async sendMail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<EmailDispatchResult> {
    if (!to || !to.trim()) {
      this.logger.warn(
        `Skipped email ("${subject}"): missing recipient email address.`,
      );
      return {
        success: false,
        messageId: null,
        reason: 'Missing recipient email address',
      };
    }

    const cleanRecipient = to.trim();
    const mailOptions = {
      from: `"Ingeni Market" <${process.env.SMTP_USER}>`,
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
      throw new InternalServerErrorException(
        `Email pipeline breakdown: ${error.message}`,
      );
    }
  }

  /**
   * Non-blocking fire-and-forget dispatcher for auth & signup flows
   */
  sendInBackground(to: string, subject: string, htmlContent: string): void {
    this.sendMail(to, subject, htmlContent).catch((err) => {
      this.logger.error(
        `Background email dispatch failed | to=${to} | subject="${subject}" | error=${err?.message || err}`,
      );
    });
  }

  queueVerificationEmail(
    recipientEmail: string,
    recipientName: string,
    verificationUrl: string,
  ): void {
    const subject = 'Verify your Ingeni Market account';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 22px; border-radius: 10px; color: #111;">
        <h2 style="color: #2563eb; margin-top: 0;">Welcome to Ingeni Market, ${recipientName || 'Shopper'}!</h2>
        <p>Click the button below to verify your email address and activate your account.</p>
        <p style="margin: 20px 0;">
          <a href="${verificationUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
            Verify Email
          </a>
        </p>
        <div style="margin-top: 24px; font-size: 12px; color: #666;">
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a></p>
        </div>
      </div>
    `;
    this.sendInBackground(recipientEmail, subject, html);
  }

  queuePasswordResetEmail(
    recipientEmail: string,
    recipientName: string,
    resetUrl: string,
  ): void {
    const subject = 'Reset your Ingeni Market password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 22px; border-radius: 10px; color: #111;">
        <h2 style="color: #2563eb; margin-top: 0;">Reset Your Ingeni Market Password</h2>
        <p>Hello ${recipientName || 'there'},</p>
        <p>We received a request to reset your password. Click the button below to choose a new password:</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
            Reset Password
          </a>
        </p>
        <p style="font-size: 13px; color: #4b5563;">If you did not request a password reset, you can safely ignore this email.</p>
        <div style="margin-top: 24px; font-size: 12px; color: #666;">
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a></p>
        </div>
      </div>
    `;
    this.sendInBackground(recipientEmail, subject, html);
  }

  async sendSubscriptionWelcomeEmail(
    recipientEmail: string,
    recipientName: string,
    unsubscribeUrl: string,
  ): Promise<EmailDispatchResult> {
    const subject = '✅ Welcome to Ingeni Market Alerts & Deals';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 22px; border-radius: 10px;">
        <h2 style="color: #059669; margin-top: 0;">You're Subscribed to Ingeni Market</h2>
        <p>Hello ${recipientName || 'Shopper'},</p>
        <p>Thank you for subscribing to <strong>Ingeni Market</strong>. We'll notify you whenever new products arrive, listings go live, or special deals drop.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 22px 0;" />
        <footer style="font-size: 12px; color: #777777; line-height: 1.6;">
          You subscribed with <strong>${recipientEmail}</strong>.<br />
          No longer want product alerts? <a href="${unsubscribeUrl}" style="color: #dc2626; text-decoration: underline;">Unsubscribe from Ingeni Market emails</a>.
        </footer>
      </div>
    `;
    return this.sendMail(recipientEmail, subject, html);
  }

  async sendNewProductMarketAlert(
    recipientEmail: string,
    recipientName: string,
    product: NewProductAlertPayload,
    unsubscribeUrl: string,
  ): Promise<EmailDispatchResult> {
    const baseUrl = this.resolveFrontendBaseUrl();
    const productUrl = `${baseUrl}/products/${product.productSlug}`;
    const subject = `🆕 New on Ingeni Market: ${product.productTitle}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 22px; border-radius: 10px;">
        <h2 style="color: #059669; margin-top: 0;">Fresh Arrival on Ingeni Market</h2>
        <p>Hello ${recipientName || 'Shopper'},</p>
        <p>A new product has just been added to <strong>Ingeni Market</strong>:</p>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 14px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Product:</strong> ${product.productTitle}</p>
          <p style="margin: 4px 0;"><strong>Price:</strong> RWF ${Number(product.price || 0).toLocaleString()}</p>
          ${product.categoryName ? `<p style="margin: 4px 0;"><strong>Category:</strong> ${product.categoryName}</p>` : ''}
          ${product.storeName ? `<p style="margin: 4px 0;"><strong>Store:</strong> ${product.storeName}</p>` : ''}
          ${product.location ? `<p style="margin: 4px 0;"><strong>Location:</strong> ${product.location}</p>` : ''}
        </div>
        <p style="margin-top: 18px;">
          <a href="${productUrl}" style="background: #059669; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Product on Ingeni Market</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 22px 0;" />
        <footer style="font-size: 12px; color: #777777; line-height: 1.6;">
          You received this alert because <strong>${recipientEmail}</strong> is subscribed to Ingeni Market updates.<br />
          To stop receiving these emails, <a href="${unsubscribeUrl}" style="color: #dc2626; text-decoration: underline;">unsubscribe here</a>.
        </footer>
      </div>
    `;

    return this.sendMail(recipientEmail, subject, html);
  }

  async broadcastNewProductToSubscribers(
    subscribers: SubscriberRecipient[],
    product: NewProductAlertPayload,
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const sub of subscribers) {
      if (!sub?.email) continue;
      const unsubscribeUrl = this.buildUnsubscribeUrl(sub.unsubscribeToken);

      try {
        const res = await this.sendNewProductMarketAlert(
          sub.email,
          sub.name || 'Shopper',
          product,
          unsubscribeUrl,
        );
        if (res.success) sent += 1;
        else failed += 1;
      } catch (err) {
        failed += 1;
        this.logger.error(
          `Failed to send new product alert to subscriber ${sub.email}:`,
          err,
        );
      }
    }

    this.logger.log(
      `Ingeni Market new product broadcast for "${product.productTitle}" -> sent=${sent}, failed=${failed}`,
    );
    return { sent, failed };
  }

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
        <p>Your vendor profile and store details for <strong>${storeName}</strong> have been updated on <strong>Ingeni Market</strong>.</p>
        ${fieldsList}
        <p style="font-size: 13px; color: #4B5563;">If you did not request or authorize these changes, please contact support immediately.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <footer style="font-size: 12px; color: #777777;">
          Automated notification from Ingeni Market Systems.
        </footer>
      </div>
    `;
    return this.sendMail(vendorEmail, subject, html);
  }

  async sendProductCreationAlert(
    vendorEmail: string,
    vendorName: string,
    productTitle: string,
  ) {
    const subject = `🚀 Product Published Successfully on Ingeni Market: ${productTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #4F46E5;">Hello ${vendorName},</h2>
        <p>Congratulations! Your new marketplace listing, <strong>${productTitle}</strong>, is now live on <strong>Ingeni Market</strong>.</p>
        <p style="margin-top: 20px;">Subscribers and platform shoppers are being notified of your new listing.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <footer style="font-size: 12px; color: #777777;">
          Automated operational notification for Ingeni Market Vendors.
        </footer>
      </div>
    `;
    return this.sendMail(vendorEmail, subject, html);
  }

  async sendProductUpdateAlert(
    vendorEmail: string,
    vendorName: string,
    productTitle: string,
  ) {
    const subject = `🔄 Listing Profile Modified on Ingeni Market: ${productTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2563EB;">Listing Update Confirmation</h2>
        <p>Dear ${vendorName},</p>
        <p>This message confirms a successful change was saved to your item <strong>${productTitle}</strong> on <strong>Ingeni Market</strong>.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <footer style="font-size: 12px; color: #777777;">
          Security logging notification from Ingeni Market Systems.
        </footer>
      </div>
    `;
    return this.sendMail(vendorEmail, subject, html);
  }

  async sendSecurityIssueRequest(
    vendorEmail: string,
    storeName: string,
    issueDetails: string,
  ) {
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
      </div>
    `;
    return this.sendMail(systemAdminEmail, subject, html);
  }

  async sendVendorOnboardingRequest(
    userName: string,
    userEmail: string,
    businessDescription: string,
  ) {
    const adminEmail = process.env.SMTP_USER as string;
    const frontendBase = this.resolveFrontendBaseUrl();
    const subject = `🆕 New Vendor Onboarding Request: ${userName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #d1d5db; border-radius: 8px;">
        <h2 style="color: #059669;">New Vendor Application</h2>
        <p>A user has requested to join as a vendor on <strong>Ingeni Market</strong>.</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Business Context:</strong><br>${businessDescription}</p>
        </div>
        <p style="margin-top: 20px;">
          <a href="${process.env.ADMIN_DASHBOARD_URL || `${frontendBase}/admin/vendors`}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review in Admin Panel</a>
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
    const subject = `🧾 Order Confirmed on Ingeni Market: ${orderNumber}`;
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
        <p>We have received your order <strong>${orderNumber}</strong> on <strong>Ingeni Market</strong>.</p>
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
        <footer style="font-size: 12px; color: #6b7280;">Ingeni Market Order Tracking</footer>
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
    const subject = `📦 Order ${orderNumber} Status: ${status} - Ingeni Market`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2563EB; margin-top: 0;">Order Tracking Update</h2>
        <p>Hello ${customerName},</p>
        <p>Your order <strong>${orderNumber}</strong> on <strong>Ingeni Market</strong> has been updated.</p>
        <p><strong>Fulfillment Status:</strong> ${status}</p>
        ${paymentStatus ? `<p><strong>Payment Status:</strong> ${paymentStatus}</p>` : ''}
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <footer style="font-size: 12px; color: #6b7280;">Ingeni Market Order Tracking</footer>
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
    const subject = `💳 Payment Update for Order ${orderNumber}: ${paymentStatus} - Ingeni Market`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
        <h2 style="color: #4F46E5; margin-top: 0;">Payment Status Update</h2>
        <p>Hello ${customerName},</p>
        <p>The payment status for order <strong>${orderNumber}</strong> on <strong>Ingeni Market</strong> is now <strong>${paymentStatus}</strong>.</p>
        ${note ? `<p>${note}</p>` : ''}
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <footer style="font-size: 12px; color: #6b7280;">Ingeni Market Billing & Order Tracking</footer>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }
}