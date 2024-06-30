import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RutaModule } from './ruta/ruta.module';
import { TicketModule } from './ticket/ticket.module';

@Module({
  imports: [PrismaModule, AuthModule, RutaModule, TicketModule],
})
export class AppModule {}
