import nodemailer from 'nodemailer';
import { logger }  from '@shared/logger';
import { config }  from '../../config';

export class EmailClient {
  private readonly transport = nodemailer.createTransport({
    host:   config.smtpHost,
    port:   config.smtpPort,
    secure: config.smtpPort === 465,
    auth: { user: config.smtpUser, pass: config.smtpPass },
  });

  async sendOtp(to: string, otp: string): Promise<void> {
    if (!config.smtpUser || !config.smtpPass) {
      logger.info({ to, otp }, '[EMAIL:no-smtp] OTP (SMTP not configured — set SMTP_USER and SMTP_PASS)');
      return;
    }
    await this.transport.sendMail({
      from:    `"CMP" <${config.smtpUser}>`,
      to,
      subject: 'Your Password Reset Code — CMP',
      html:    `<p>Your password reset verification code is:</p>
                <h2 style="letter-spacing:4px">${otp}</h2>
                <p>This code expires in <strong>15 minutes</strong>.</p>
                <p>If you did not request this, ignore this email.</p>`,
    });
  }
}
