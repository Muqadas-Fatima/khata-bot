import { SentryModule } from '@sentry/nestjs/setup';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesController } from './messages/messages.controller';
import { OrdersController } from './orders/orders.controller';
import { DashboardController } from './dashboard/dashboard.controller';
import { NotificationsController } from './notifications/notifications.controller';
import { PrismaService } from './prisma.service';
import { AiService } from './ai/ai.service';
import { OrdersService } from './orders/orders.service';
import { CatalogueService } from './catalogue/catalogue.service';
import { PaymentsService } from './payments/payments.service';
import { CustomersService } from './customers/customers.service';
import { NotificationsService } from './notifications/notifications.service';

@Module({
  imports: [SentryModule.forRoot()],
  controllers: [AppController, MessagesController, OrdersController, DashboardController, NotificationsController],
  providers: [AppService, PrismaService, AiService, OrdersService, CatalogueService, PaymentsService, CustomersService, NotificationsService],
})
export class AppModule {}