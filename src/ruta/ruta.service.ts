import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RutaValidateDto } from './dto/ruta-validate.dto';

@Injectable()
export class RutaService {
  constructor(private prisma: PrismaService) {}

/**
 * Creates a new route.
 * @param {RutaValidateDto} routeData - The data for the new route.
 * @returns {Promise<{ message: string, data?: any }>} - A promise that resolves to an object containing a success message and the created route data, or an error message if the route creation fails.
 */
  async createRoute({
    salida,
    llegada,
    fecha_hora,
    puerta,
    precio_adulto,
    precio_nino,
    precio_tercera_edad,
    cantidad_boletos,
  }: RutaValidateDto) {
    try {
     const data = await this.prisma.ruta.create({
        data: {
          salida,
          llegada,
          fecha_hora,
          puerta,
          precio_adulto,
          precio_nino,
          precio_tercera_edad,
          cantidad_boletos,
        },
      });
      return { message: 'Ruta creada con exito', data};
    } catch (error) {
      return { message: 'Error al crear la ruta' };
    }
  }

/**
 * Retrieves all routes.
 * @returns {Promise<{ message: string, data?: any[] }>} The result of the operation, including a message and the retrieved routes (if successful).
 */
  async getRoutes() {
    try {
      const data = await this.prisma.ruta.findMany();
      return { message: 'Rutas encontradas', data };
    } catch (error) {
      return { message: 'Error al buscar las rutas' };
    }
  }

/**
 * Retrieves a route by its ID.
 * @param id - The ID of the route to retrieve.
 * @returns A promise that resolves to an object containing the message and data of the retrieved route, or an error message if the route is not found.
 */
  async getRouteById(id: string) {
    try {
      const data = await this.prisma.ruta.findUnique({
        where: { rutaId: Number(id) },
      });
      return { message: 'Ruta encontrada', data };
    } catch (error) {
      return { message: 'Error al buscar la ruta' };
    }
  }

/**
 * Updates a route with the specified ID.
 * @param id - The ID of the route to update.
 * @param data - The data to update the route with.
 * @returns An object containing a message and the updated route data, or an error message.
 */
  async updateRoute(id: string, data: RutaValidateDto) {
    try {
        const route = await this.prisma.ruta.findUnique({
            where: { rutaId: Number(id) },
        });
        if (!route) {
            return { message: 'Ruta no encontrada' };
        }
        const updatedRoute = await this.prisma.ruta.update({
            where: { rutaId: Number(id)},
            data: {
            ...data,
            },
        });
        return { message: 'Ruta actualizada con exito', data: updatedRoute };
    } catch {
        return { message: 'Error al actualizar la ruta' };
    }
  }

/**
 * Deletes a route by its ID.
 * @param id - The ID of the route to delete.
 * @returns A message indicating the result of the deletion operation.
 */
  async deleteRoute(id: string) {
    try {
      const route = await this.prisma.ruta.findUnique({
        where: { rutaId: Number(id) },
      });
      if (!route) {
        return { message: 'Ruta no encontrada' };
      }
      await this.prisma.ruta.delete({
        where: { rutaId: Number(id) },
      });
      return { message: 'Ruta eliminada con exito' };
    } catch {
      return { message: 'Error al eliminar la ruta' };
    }
  }
}
