import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async getUsers() {
        try {
            const data = await this.prisma.usuario.findMany({
                select: {
                    usuarioId: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true
                }
            })
            if(!data) {
              throw new HttpException(
                {
                    messageError: 'Data not found',
                },
                HttpStatus.NOT_FOUND
              )
            }
            return {message: 'Data fetched successfully', data};

        } catch (error) {
           return {message: 'Error fetching data', error};
        }
    }
    async getUserById(id: string) {
        try {
            const data = await this.prisma.usuario.findUnique({
                where: {
                    usuarioId: Number(id)
                },
                select: {
                    usuarioId: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true
                }
            })
            if(!data) {
              throw new HttpException(
                {
                    messageError: 'Data not found',
                },
                HttpStatus.NOT_FOUND
              )
            }
            return {message: 'Data fetched successfully', data};

        } catch (error) {
           return {message: 'Error fetching data', error};
        }
    }
}
