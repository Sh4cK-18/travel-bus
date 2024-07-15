import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: 'https://web-travel-bus-git-main-ramsezgms-projects.vercel.app',
    credentials: true,
  })

/*   app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'", 
          "'unsafe-inline'", 
          "'unsafe-eval'", 
          "https://*.paypal.com", 
          "https://*.paypal.cn", 
          "https://*.paypalobjects.com"
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://www.paypalobjects.com"],
        connectSrc: ["'self'", "https://api.sandbox.paypal.com"],
        frameSrc: ["'self'", "https://www.paypal.com"],
      },
    },
  })); */
  


  app.setGlobalPrefix('api/v1');

  await app.listen(8080);
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
