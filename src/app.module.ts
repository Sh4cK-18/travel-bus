import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RutaModule } from './ruta/ruta.module';
import { TicketModule } from './ticket/ticket.module';
import { UserModule } from './user/user.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [PrismaModule, AuthModule, RutaModule, TicketModule, UserModule, PaymentModule],
})
export class AppModule {}
