import {
  Body,
  Controller,
  Post,
  UsePipes,
  Res,
  ValidationPipe,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAccessDto } from './dto/register-access.dto';
import { LoginAccessDto } from './dto/login-access.dto';
import { Usuario as UsuarioModel } from '@prisma/client';
import { Response } from 'express';
import { RolesGuard } from './guard/roles.guard';



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
     try {
       const result = await this.authService.validateUser(data, res);
       res.cookie('token', result.token, {
         httpOnly: true,
         secure: true,
         sameSite: 'none',
         maxAge: 3600000,
       });
 
       return res.json(result); 
     } catch (error) {
       console.error(error);
       throw new UnauthorizedException();
     }
   }

  @Post('admin-auth')
  @UseGuards(RolesGuard)
  @UsePipes(new ValidationPipe())
  async adminAuth(@Body() data: LoginAccessDto, @Res() res: Response) {
    try {
      const result = await this.authService.validateAdmin(data, res);
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 3600000,
      });
      return res.json(result);
    } catch (error) {
      throw new UnauthorizedException('You are not authorized to access this resource.');
    }
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
  


