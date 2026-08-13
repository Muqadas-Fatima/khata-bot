import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class NotificationsService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async emailOwner(subject: string, body: string) {
    return this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.OWNER_EMAIL as string,
      subject,
      html: `<p>${body}</p>`,
    });
  }
}