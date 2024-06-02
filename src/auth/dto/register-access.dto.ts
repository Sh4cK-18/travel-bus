import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterAccessDto {
  @IsString()
  @MinLength(3)
  @MaxLength(10)
  nombre: string;

  @IsString()
  @MinLength(3)
  @MaxLength(10)
  apellido: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Transform(({ value }) => value.trim())
  password: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(['ADMINISTRADOR', 'USUARIO', 'CONDUCTOR'], { each: true })
  roles: string[];
}
