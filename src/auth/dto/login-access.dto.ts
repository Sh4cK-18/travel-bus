import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginAccessDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @Transform(({ value }) => value.trim())
    password: string;

}