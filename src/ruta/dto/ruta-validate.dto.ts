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

    @IsDecimal()
    @IsNotEmpty()
    precio_adulto: number

    @IsDecimal()
    @IsNotEmpty()
    precio_nino: number

    @IsDecimal()
    @IsNotEmpty()
    precio_tercera_edad: number

    @IsInt()
    @IsNotEmpty()
    cantidad_boletos: number 
}