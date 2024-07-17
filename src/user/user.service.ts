import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { bucket } from 'src/firebase.config';

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
                    profilePicture: true,
                    createdAt: true,
                    updatedAt: true,
                    roles: {
                        select: {
                            rol: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }   
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
                    profilePicture: true,
                    createdAt: true,
                    updatedAt: true,
                    roles: {
                        select: {
                            rol: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
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
    async updateUser(id: string, updateData: { nombre?: string; apellido?: string; password?: string; roles?: string[] }) {
        try {
            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            let rolesArray = [];
            if (updateData.roles) {
                if (updateData.roles.length === 0) {
                    const defaultRole = await this.prisma.rol.findFirst({
                        where: {
                            name: 'USUARIO',
                        },
                    });
                    rolesArray.push({ rolId: defaultRole.rolId });
                } else {
                    const provideRole = await this.prisma.rol.findMany({
                        where: {
                            name: {
                                in: updateData.roles,
                            },
                        },
                    });
                    if (provideRole.length > 0) {
                        rolesArray = provideRole.map(role => ({ rolId: role.rolId }));
                    } else {
                        throw new BadRequestException('One or more roles do not exist');
                    }
                }
            }

            const data = await this.prisma.usuario.update({
                where: {
                    usuarioId: Number(id)
                },
                data: {
                    ...updateData,
                    roles: {
                        deleteMany: {},
                        create: rolesArray.map(role => ({
                            rol: {
                                connect: {
                                    rolId: role.rolId,
                                },
                            },
                        })),
                    },
                },
                select: {
                    usuarioId: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                    roles: {
                        select: {
                            rol: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    createdAt: true,
                    updatedAt: true
                }
            });
            return { message: 'User updated successfully', data };
        } catch (error) {
            throw new HttpException(
                {
                    messageError: 'Error updating user',
                    error: error.message,
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async deleteUser(id: string) {
        try {
            const user = await this.prisma.usuario.findUnique({
                where: {
                    usuarioId: Number(id),
                },
            });
            if (!user) {
                throw new HttpException(
                    {
                        messageError: 'User not found',
                    },
                    HttpStatus.NOT_FOUND
                );
            }
    
            if (user.profilePicture) {
                const fileName = user.profilePicture.split('/').pop();
                const fileToDelete = bucket.file(fileName);
    
                try {
                    await fileToDelete.delete();
                } catch (fileError) {
                    console.error(`Error deleting file: ${fileError.message}`);
                    // No se lanza una excepción aquí para asegurar que el usuario se elimine
                }
            }
    
            await this.prisma.usuario.delete({
                where: {
                    usuarioId: Number(id),
                },
            });
    
            return { message: 'User deleted successfully' };
        } catch (error) {
            throw new HttpException(
                {
                    messageError: 'Error deleting user',
                    error: error.message,
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }    

    async updateProfilePicture(id: string, file: Express.Multer.File) {
        try {
            const user = await this.prisma.usuario.findUnique({
                where: {
                    usuarioId: Number(id),
                },
            });
            if (!user) {
                throw new HttpException(
                    {
                        messageError: 'User not found',
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            if (user.profilePicture) {
                const fileName = user.profilePicture.split('/').pop();
                const fileToDelete = bucket.file(fileName);
                await fileToDelete.delete();
            }

            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;
            const fileUpload = bucket.file(fileName);

            await fileUpload.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                },
                public: true,
                validation: 'md5',
            });

            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

            const updatedUser = await this.prisma.usuario.update({
                where: {
                    usuarioId: Number(id),
                },
                data: {
                    profilePicture: publicUrl,
                },
                select: {
                    usuarioId: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                    profilePicture: true,
                    roles: {
                        select: {
                            rol: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return { message: 'Profile picture updated successfully', data: updatedUser };
        } catch (error) {
            throw new HttpException(
                {
                    messageError: 'Error updating profile picture',
                    error: error.message,
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
