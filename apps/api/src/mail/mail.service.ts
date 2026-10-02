import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { AppConfig } from '../config/app-config';
import type { RenderedEmail } from './mail-templates';

export interface SendMailInput extends RenderedEmail {
  to: string | string[];
  replyTo?: string;
}

/**
 * Sends transactional email through SMTP, AWS SES or (development) the log.
 * Sending never throws to the caller — a failed notification must not fail the user's request.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly smtp?: Transporter;
  private readonly ses?: SESv2Client;

  constructor(private readonly config: AppConfig) {
    const { env } = config;
    if (env.MAIL_TRANSPORT === 'smtp') {
      this.smtp = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
      });
    } else if (env.MAIL_TRANSPORT === 'ses') {
      this.ses = new SESv2Client({ region: env.AWS_SES_REGION ?? env.AWS_REGION });
    }
  }

  async send(input: SendMailInput): Promise<boolean> {
    const to = (Array.isArray(input.to) ? input.to : [input.to]).filter(Boolean);
    if (to.length === 0) {
      this.logger.warn(`Email "${input.subject}" skipped: no recipient configured`);
      return false;
    }
    const from = this.config.env.MAIL_FROM;
    try {
      if (this.smtp) {
        await this.smtp.sendMail({ from, to, replyTo: input.replyTo, subject: input.subject, html: input.html, text: input.text });
      } else if (this.ses) {
        await this.ses.send(
          new SendEmailCommand({
            FromEmailAddress: from,
            Destination: { ToAddresses: to },
            ReplyToAddresses: input.replyTo ? [input.replyTo] : undefined,
            Content: {
              Simple: {
                Subject: { Data: input.subject, Charset: 'UTF-8' },
                Body: { Html: { Data: input.html, Charset: 'UTF-8' }, Text: { Data: input.text, Charset: 'UTF-8' } },
              },
            },
          }),
        );
      } else {
        this.logger.log(`[mail:log] to=${to.join(',')} subject="${input.subject}"\n${input.text}`);
      }
      return true;
    } catch (error) {
      this.logger.error(`Failed to send "${input.subject}" to ${to.join(',')}: ${(error as Error).message}`);
      return false;
    }
  }
}
