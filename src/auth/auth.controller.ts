import {
  Body,
  Controller,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAccessDto } from './dto/register-access.dto';
import { LoginAccessDto } from './dto/login-access.dto';
import { Usuario as UsuarioModel } from '@prisma/client';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user.
   * @param data - The registration data.
   * @returns A promise that resolves to the created user.
   */
  @Post('signup')
  @UsePipes(new ValidationPipe())
  async signup(@Body() data: RegisterAccessDto): Promise<UsuarioModel> {
    return this.authService.createUser(data);
  }

  /**
   * Authenticates a user and returns a token.
   * @param data - The login access data.
   * @returns A promise that resolves to an object containing the token.
   */
  @Post('signin')
  @UsePipes(new ValidationPipe())
  async login(@Body() data: LoginAccessDto): Promise<{ token: string }> {
    return this.authService.validateUser(data);
  }
  
}
