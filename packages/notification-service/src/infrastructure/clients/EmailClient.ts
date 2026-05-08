import sgMail  from '@sendgrid/mail';
import { config } from '../../config';

export interface SendMailInput {
  to:      string;
  subject: string;
  html:    string;
}

export class EmailClient {
  constructor() {
    sgMail.setApiKey(config.sendgridApiKey);
  }

  async sendMail(input: SendMailInput): Promise<void> {
    await sgMail.send({ from: config.emailFrom, to: input.to, subject: input.subject, html: input.html });
  }
}
