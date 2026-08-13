import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomersService } from '../customers/customers.service';
import { AiService } from '../ai/ai.service';
import { OrdersService } from '../orders/orders.service';
import { CatalogueService } from '../catalogue/catalogue.service';
import { PaymentsService } from '../payments/payments.service';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(
    private customers: CustomersService,
    private ai: AiService,
    private orders: OrdersService,
    private catalogue: CatalogueService,
    private payments: PaymentsService,
  ) {}

  @Post('handle')
  @ApiOperation({ summary: 'Handles incoming WhatsApp message from n8n' })
  async handle(@Body() dto: { from: string; type: string; text?: string; mediaUrl?: string }) {
    const text = dto.text ?? '';
    const isOwner = dto.from === process.env.OWNER_WHATSAPP_NUMBER;
    const customer = await this.customers.findOrCreate(dto.from);

    if (dto.type === 'image') return this.payments.saveScreenshot(customer.id, dto.mediaUrl ?? '');

    if (customer.awaitingName && !isOwner) {
      await this.customers.saveName(customer.id, text);
      return { replyToCustomer: `Thanks! Saved as "${text}". Send your order or type MENU.`, notifyOwner: false };
    }

    const intent = await this.ai.classify(text, isOwner);

    switch (intent.type) {
      case 'ORDER': return this.orders.createFromText(customer, text);
      case 'CATALOGUE_QUERY': return this.catalogue.replyWithMenu();
      case 'TALK_TO_OWNER': return { replyToCustomer: 'Connecting you with the owner shortly.', notifyOwner: true, ownerMessage: `${customer.name || dto.from} wants to talk: "${text}"` };
      case 'OWNER_ADD_PRODUCT': return this.catalogue.addFromText(text);
      case 'OWNER_CONFIRM_PAYMENT': return this.payments.confirmFromText(text);
      case 'OWNER_KHATA': return this.orders.pendingSummary();
      default: return { replyToCustomer: 'Send your order, type MENU, or ask to talk to the owner.', notifyOwner: false };
    }
  }
}