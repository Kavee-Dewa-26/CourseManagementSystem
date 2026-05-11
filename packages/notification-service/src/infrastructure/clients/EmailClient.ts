import sgMail        from '@sendgrid/mail';
import { logger }    from '@shared/logger';
import { config }    from '../../config';

export interface SendMailInput {
  to:      string;
  subject: string;
  html:    string;
}

export class EmailClient {
  private readonly useConsole: boolean;

  constructor() {
    this.useConsole = process.env.EMAIL_PROVIDER === 'console';
    if (!this.useConsole) {
      sgMail.setApiKey(config.sendgridApiKey);
    }
  }

  async sendMail(input: SendMailInput): Promise<void> {
    if (this.useConsole) {
      logger.info({ to: input.to, subject: input.subject }, '[EMAIL:console] email would be sent');
      return;
    }
    await sgMail.send({ from: config.emailFrom, to: input.to, subject: input.subject, html: input.html });
  }
}
