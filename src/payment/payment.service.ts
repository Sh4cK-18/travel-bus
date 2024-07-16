import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDTO } from './dto/payment-valid.dto';
import Stripe from 'stripe';
import * as QRCode from 'qrcode';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });
  }

  async processPayment(createPaymentDTO: CreatePaymentDTO) {
    const { boletoId, userId } = createPaymentDTO;

    if (!boletoId || !userId) {
      throw new HttpException('boletoId y userId son requeridos', HttpStatus.BAD_REQUEST);
    }

    try {
      const boleto = await this.prisma.boleto.findUnique({
        where: { boletoId }
      });

      if (!boleto) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }

      const precio: number = Number(boleto.totalPrice);

      if (isNaN(precio)) {
        throw new HttpException('Precio no es un número válido', HttpStatus.BAD_REQUEST);
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: precio * 100, // Stripe trabaja en centavos
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: { boletoId: boletoId.toString(), userId: userId.toString() },
      });

      const qrCodeUrl = await QRCode.toDataURL(`Compra ID: ${boletoId}`);

      const compra = await this.prisma.compra.create({
        data: {
          boleto: { connect: { boletoId } },
          usuario: { connect: { usuarioId: userId } },
          precio,
          qrCode: qrCodeUrl,
          qrCodeStatus: 'ACTIVE',
        },
      });

      await this.prisma.boleto.update({
        where: { boletoId },
        data: { proceso_compra: 'comprado' },
      });

      return {
        message: 'Payment completed successfully',
        qrCodeUrl,
        clientSecret: paymentIntent.client_secret,
        compraId: compra.compraId,
      };
    } catch (error) {
      console.error('Error creating payment:', error.message, error.stack);
      throw new HttpException(`Error creating payment: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateQR(qrCode: string) {
    try {
      const compra = await this.prisma.compra.findFirst({
        where: {
          qrCode: qrCode, qrCodeStatus: 'ACTIVE'
        }
      });

      if (!compra) {
        throw new HttpException('QR Code not found', HttpStatus.NOT_FOUND);
      }

      await this.prisma.compra.update({
        where: { compraId: compra.compraId },
        data: { qrCodeStatus: 'USED' },
      });

      return { message: 'QR Code validated successfully and now marked as used' };
    } catch (error) {
      console.error('Error validating QR code:', error.message, error.stack);
      throw new HttpException(`Error validating QR code: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
