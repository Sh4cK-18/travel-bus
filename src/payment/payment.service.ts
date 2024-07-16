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

        const boleto = await this.prisma.boleto.findUnique({
            where: { boletoId }
        });

        if (!boleto) {
            throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
        }

        const precio: number = Number(boleto.totalPrice);

        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: precio * 100, // Stripe trabaja en centavos
                currency: 'usd',
                payment_method_types: ['card'],
                capture_method: 'automatic', // Captura automática al confirmar el pago
                metadata: { boletoId: boletoId.toString(), userId: userId.toString() },
            });

            const compra = await this.prisma.compra.create({
                data: {
                    boletoId,
                    userId,
                    precio,
                }
            });

            return {
                clientSecret: paymentIntent.client_secret,
                compraId: compra.compraId,
            };
        } catch (error) {
            throw new HttpException('Error creating payment', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async handlePaymentSuccess(paymentIntentId: string, compraId: number) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

            if (paymentIntent.status === 'succeeded') {
                const qrCodeUrl = await QRCode.toDataURL(`Compra ID: ${compraId}`);

                await this.prisma.compra.update({
                    where: { compraId },
                    data: {
                        boleto: {
                            update: {
                                proceso_compra: 'comprado',
                            },
                        },
                        qrCode: qrCodeUrl,
                        qrCodeStatus: 'ACTIVE',
                    },
                });

                return {
                    message: 'Payment completed successfully',
                    qrCodeUrl,
                };
            } else {
                throw new Error('Payment not completed');
            }
        } catch (error) {
            console.error('Error handling payment success:', error);
            throw new HttpException('Error handling payment success', HttpStatus.BAD_REQUEST);
        }
    }

    async validateQR(qrCode: string) {
        const compra = await this.prisma.compra.findFirst({
            where: {
                qrCode: qrCode, qrCodeStatus: 'ACTIVE'
            }
        });

        if (!compra) {
            throw new HttpException('QR Code not found', HttpStatus.NOT_FOUND);
        }

        await this.prisma.compra.update({
            where: {
                compraId: compra.compraId
            },
            data: {
                qrCodeStatus: 'USED'
            }
        });

        return { message: 'QR Code validated successfully and now marked as used' };
    }
}
