import {
  Body,
  Controller,
  Post,
  UsePipes,
  Res,
  ValidationPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAccessDto } from './dto/register-access.dto';
import { LoginAccessDto } from './dto/login-access.dto';
import { Usuario as UsuarioModel } from '@prisma/client';
import { Response } from 'express';



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
   * Sign in a user.
   *
   * @param data - The login access data.
   * @param res - The response object.
   * @returns The JSON response containing the result.
   */
   @Post('signin')
   @UsePipes(new ValidationPipe())
   async signin(@Body() data: LoginAccessDto, @Res() res: Response) {
    const result = await this.authService.validateUser(data, res);
    return res.json(result);
  }

  @Post('admin-auth')
  @UsePipes(new ValidationPipe())
  async adminAuth(@Body() data: LoginAccessDto, @Res() res: Response) {
    const result = await this.authService.validateAdmin(data, res);
    return res.json(result);
  }

/**
   * Close user session.
   * @param res - The response object.
   * @returns A promise that resolves to the result of closing the user's session.
   */
 @Post('logout')
  async logout(@Res() res: Response) {
    return this.authService.closeSession(res);
  }
}
  


