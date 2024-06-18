import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
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
          create: rolesArray.map((role) => ({
            rol: {
              connect: {
                name: role.name,
              },
            },
          })),
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

  async validateUser({ email, password }: LoginAccessDto) {
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
      sub: user.id,
      roles: user.roles.map((role) => role.rol.name),
    };

    const token = this.jwtService.sign(payload);

    return {
      ...user,
      token,
    };
  }

}
