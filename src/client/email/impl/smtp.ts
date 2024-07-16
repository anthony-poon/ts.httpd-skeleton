import { Transporter } from 'nodemailer';
import { Email, EmailClient } from '../index';
import loggerFactory from '@core/logger';
import { SmtpEnv } from '@env';

const logger = loggerFactory.create('smtp-transport');

export class SMTPClient implements EmailClient {
  constructor(
    private readonly transport: Transporter,
    private readonly env: SmtpEnv
  ) {}
  async send(emails: Email[]): Promise<void> {
    await Promise.all(emails.map(async email => {
      const info = await this.transport.sendMail({
        from: this.env.SMTP_MAILER_SOURCE,
        to: email.destinations,
        subject: email.subject,
        text: email.html,
        html: email.html,
      });
      logger.info(`Message sent: ${info.messageId}`);
      logger.debug(JSON.stringify(info))
    }))
  }
}