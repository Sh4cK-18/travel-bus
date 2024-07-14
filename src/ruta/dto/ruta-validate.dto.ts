import { IsDate, IsDateString, IsDecimal, IsInt, IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class RutaValidateDto {
    @IsString()
    @IsNotEmpty()
    salida: string

    @IsString()
    @IsNotEmpty()
    llegada: string

    @IsDate()
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    fecha_hora: Date

    @IsString()
    @IsNotEmpty()
    puerta: string

    @IsDecimal({force_decimal: true, decimal_digits: '1,2'})
    @IsNotEmpty()
    precio_adulto: number

    @IsDecimal({force_decimal: true, decimal_digits: '1,2'})
    @IsNotEmpty()
    precio_nino: number

    @IsDecimal({force_decimal: true, decimal_digits: '1,2'})
    @IsNotEmpty()
    precio_tercera_edad: number

 
}