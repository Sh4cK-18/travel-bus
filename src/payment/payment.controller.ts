import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDTO } from './dto/payment-valid.dto';

@Controller('payment')
export class PaymentController {
    constructor(private paymentService: PaymentService,
              
    ) {}

    @Post('create')
    async createPayment(@Body() createPaymentDto: CreatePaymentDTO) {
      return this.paymentService.createPayment(createPaymentDto);
    }
  
    @Post('capture')
  async capturePayment(@Body('orderId') orderId: string, @Body('compraId') compraId: number) {
    return this.paymentService.capturePayment(orderId, compraId);
  }

  @Post('validate-qr')
  async validateQR(@Body() body: { qrCode: string }) {
    const { qrCode } = body;
    return this.paymentService.validateQR(qrCode);
}


}
