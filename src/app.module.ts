import { Module } from '@nestjs/common';
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
  controllers: [MessagesController, OrdersController, DashboardController, NotificationsController],
  providers: [PrismaService, AiService, OrdersService, CatalogueService, PaymentsService, CustomersService, NotificationsService],
})
export class AppModule {}