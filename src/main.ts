import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  await app.listen(3000);
}
bootstrap();

async function createRoles() {
  const prisma = new PrismaService();
  try {
    const count = await prisma.rol.count();
    if (count === 0) {
      await prisma.rol.createMany({
        data: [
          { name: 'ADMINISTRADOR' },
          { name: 'USUARIO' },
          { name: 'CONDUCTOR' },
        ],
      });
      console.log('Roles creados');
    }
  } catch (error) {
    console.error(error);
  }
}

createRoles();
