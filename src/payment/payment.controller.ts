import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDTO } from './dto/payment-valid.dto';

@Controller('payment')
export class PaymentController {
    constructor(private paymentService: PaymentService,
              
    ) {}

    @Post('process')
  async processPayment(@Body() createPaymentDTO: CreatePaymentDTO) {
    try {
      const response = await this.paymentService.processPayment(createPaymentDTO);
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  


  @Post('validate-qr')
  async validateQR(@Body() body: { qrCode: string }) {
    const { qrCode } = body;
    return this.paymentService.validateQR(qrCode);
}


}
