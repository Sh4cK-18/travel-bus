import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAccessDto } from './dto/register-access.dto';
import { Usuario as UsuarioModel } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ValidationPipe())
  async signup(@Body() data: RegisterAccessDto): Promise<UsuarioModel> {
    return this.authService.createUser(data);
  }
}
