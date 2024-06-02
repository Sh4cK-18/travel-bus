import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Usuario, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterAccessDto } from './dto/register-access.dto';

/**
 * Creates a new user with the provided data.
 * @param data - The registration data for the user.
 * @returns A promise that resolves to the created user.
 * @throws BadRequestException if the email is already in use or if the provided role does not exist.
 **/

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: RegisterAccessDto): Promise<Usuario> {
    const user = await this.prisma.usuario.findUnique({
      where: {
        email: data.email,
      },
    });
    if (user) {
      throw new BadRequestException('El correo electronico ya esta en uso');
    }

    let roles = [];
    if (!data.roles) {
      const defaultRole = await this.prisma.rol.findFirst({
        where: {
          name: 'USUARIO',
        },
      });
      roles.push(defaultRole);
    } else {
      const provideRole = await this.prisma.rol.findMany({
        where: {
          name: {
            in: data.roles,
          },
        },
      });
      if (provideRole) {
        roles.push(...provideRole);
      } else {
        throw new BadRequestException('El rol no existe');
      }
    }

    const hashPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.usuario.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        password: hashPassword,
        roles: {
          create: roles.map((role) => ({
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
}
