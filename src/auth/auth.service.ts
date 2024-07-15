import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterAccessDto } from './dto/register-access.dto';
import { LoginAccessDto } from './dto/login-access.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Creates a new user with the provided data.
   * @param data - The registration data for the user.
   * @returns A promise that resolves to the created user.
   * @throws BadRequestException if the email is already in use or if the provided role does not exist.
   **/

  async createUser({nombre, apellido, email, password, roles}: RegisterAccessDto){
    const user = await this.prisma.usuario.findUnique({
      where: {
        email: email,
      },
    });
    if (user) {
      throw new BadRequestException('email already in use');
    }

    let rolesArray = [];
    if (!roles) {
      const defaultRole = await this.prisma.rol.findFirst({
        where: {
          name: 'USUARIO',
        },
      });
      rolesArray.push(defaultRole);
    } else {
      const provideRole = await this.prisma.rol.findMany({
        where: {
          name: {
            in: roles,
          },
        },
      });
      if (provideRole) {
        rolesArray.push(...provideRole);
      } else {
        throw new BadRequestException('Role does not exist');
      }
    }

    const hashPassword = await bcrypt.hash(password, 10);

    return this.prisma.usuario.create({
      data: {
        nombre: nombre,
        apellido: apellido,
        email: email,
        password: hashPassword,
        roles: {
          create: roles.map((role) => ({
            rol: {
              connect: {
                name: role,
              },
            },
          })),
        },
      },
      include: {
        roles: {
          select: {
            rol: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Validates the user credentials and returns the user data with a JWT token.
   * @param data - The login data for the user.
   * @returns A promise that resolves to the user data with a JWT token.
   * @throws UnauthorizedExceptioif the credentials are invalid.
   **/

  async validateUser({ email, password }: LoginAccessDto, res: Response) {
    const user = await this.prisma.usuario.findUnique({
      where: {
        email: email,
      },
      include: {
        roles: {
          select: {
            rol: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const payload = {
      email: user.email,
      sub: user.usuarioId,
      roles: user.roles.map((role) => role.rol.name),
    };

    const token = this.jwtService.sign(payload);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000,
    });

    return {
      ...user,
      token,
    };
  }

   /**
   * Validates the user credentials and returns the user data with a JWT token.
   * @param data - The login data for the Admin.
   * @returns A promise that resolves to the user data with a JWT token.
   * @throws UnauthorizedExceptioif the credentials are invalid.
   **/
  async validateAdmin({ email, password }: LoginAccessDto, res: Response) {
    const user = await this.prisma.usuario.findFirst({
      where: {
        email: email,
        roles: {
          some: {
            rol: {
              name: 'ADMINISTRADOR',
            },
          },
        },
      },
      include: {
        roles: {
          select: {
            rol: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const payload = {
      email: user.email,
      sub: user.usuarioId,
      roles: user.roles.map((role) => role.rol.name),
    };

    const token = this.jwtService.sign(payload); 

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000,
    });

    return {
      ...user,
      token, 
    };
  }


  /**
   * Closes the user session by clearing the token cookie.
   * 
   * @param res - The response object used to send the HTTP response.
   * @returns A promise that resolves to the HTTP response with a success message if the logout is successful,
   * or an error message if the logout fails.
   */
  async closeSession(res: Response) {
    try {
      res.clearCookie('token');
      return res.status(200).send({ message: 'Logout success' });
    } catch (error) {
      return res.status(500).send({ message: 'Logout failed', error });
    }
  }  

}
