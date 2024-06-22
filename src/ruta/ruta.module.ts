import { Module } from '@nestjs/common';
import { RutaController } from './ruta.controller';
import { RutaService } from './ruta.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [RutaController],
  providers: [RutaService],
  imports: [PrismaModule]
})
export class RutaModule {}
