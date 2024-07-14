import { IsNotEmpty, IsNumber } from "class-validator";

export class CreatePaymentDTO {
    @IsNumber()
    @IsNotEmpty()
    boletoId: number;

    @IsNumber()
    @IsNotEmpty()
    userId: number;


    
}