import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { TicketService } from 'src/ticket/ticket.service';

@Module({
  providers: [PaymentService, TicketService],
  controllers: [PaymentController],
  imports: [PrismaModule, TicketModule],
})
export class PaymentModule {}
