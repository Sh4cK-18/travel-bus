import { IsInt, IsNotEmpty } from "class-validator";

export class TicketDto {
  @IsInt()
  @IsNotEmpty()
  rutaId: number;

  @IsInt()
  @IsNotEmpty()
  cantidad_adulto:number; ;

  @IsInt()
  @IsNotEmpty()
  cantidad_nino: number;

  @IsInt()
  @IsNotEmpty()
  cantidad_tercera_edad: number;


}