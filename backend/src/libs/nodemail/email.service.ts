import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'callebhabyar55@gmail.com',
        pass: process.env.SMTP_PASS || 'fevw ozes scqg vxpn',
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'true',
      },
    });
  }

  /**
   * Core execution method to dispatch raw mail payloads
   */
  async sendMail(to: string, subject: string, htmlContent: string) {
    const mailOptions = {
      from: `"Ingeri Store Support" <${process.env.SMTP_USER || 'callebhabyar55@gmail.com'}>`,
      to,
      subject,
      html: htmlContent,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      throw new InternalServerErrorException(`Email pipeline breakdown: ${error.message}`);
    }
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
    // Dispatches a highly visible critical alert to your primary admin mailbox
    const systemAdminEmail = process.env.SMTP_USER || 'callebhabyar55@gmail.com';
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
}