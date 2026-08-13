import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notify')
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Post('owner-email')
  send(@Body() dto: { subject: string; body: string }) {
    return this.svc.emailOwner(dto.subject, dto.body);
  }
}