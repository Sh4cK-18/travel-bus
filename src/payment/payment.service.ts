import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDTO } from './dto/payment-valid.dto';
import * as paypal from '@paypal/checkout-server-sdk';
import * as QRCode from 'qrcode';

@Injectable()
export class PaymentService {
    constructor(private prisma: PrismaService) {}

    async createPayment(CreatePaymentDTO: CreatePaymentDTO) {
        const {boletoId, userId} = CreatePaymentDTO;

        const boleto = await this.prisma.boleto.findUnique({
            where: {boletoId}
        });

        if (!boleto) {
            throw new HttpException(
              {
                messageError: 'Ticket not found',
              },
              HttpStatus.NOT_FOUND
            );
          }

          const precio = boleto.totalPrice;

        const enviroment = new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
        );

        const client = new paypal.core.PayPalHttpClient(enviroment);

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: precio.toString()
                }
            }]
        });

        const response = await client.execute(request);

        const compra = await this.prisma.compra.create({
            data: {
                boletoId,
                userId,
                precio,
            }
        });
        
        return {
            ...response.result,
            compraId: compra.compraId
        }
    }

    async capturePayment(orderId: string, compraId: number) {
        try {
            const environment = new paypal.core.SandboxEnvironment(
                process.env.PAYPAL_CLIENT_ID,
                process.env.PAYPAL_CLIENT_SECRET
            );
            const client = new paypal.core.PayPalHttpClient(environment);
        
            const request = new paypal.orders.OrdersCaptureRequest(orderId);
            request.requestBody({});
            const response = await client.execute(request);
        
            if (response.result.status === 'COMPLETED') {
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
            console.error('Error capturing payment:', error);
            throw new HttpException('Error capturing payment', HttpStatus.BAD_REQUEST);
        }
    }

    async validateQR (qrCode: string) {
        const compra = await this.prisma.compra.findFirst({
            where: {
                qrCode: qrCode, qrCodeStatus: 'ACTIVE'
            }
        });

        if (!compra) {
            throw new HttpException(
              {
                messageError: 'QR Code not found',
              },
              HttpStatus.NOT_FOUND
            );
          }

          await this.prisma.compra.update({
                where: {
                    compraId: compra.compraId
                },
                data: {
                    qrCodeStatus: 'USED'
                }
          });

          return {message: 'QR Code validated successfully and now marked as used'};
    }
    
    
}
