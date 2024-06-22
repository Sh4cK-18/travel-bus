import { IsNotEmpty, IsString } from "class-validator";

export class RutaValidateDto {
    @IsString()
    @IsNotEmpty()
    salida: string
}