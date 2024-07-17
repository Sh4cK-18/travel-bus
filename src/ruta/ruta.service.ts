import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RutaValidateDto } from './dto/ruta-validate.dto';


@Injectable()
export class RutaService {
  findRoutes(salida: string, llegada: string) {
    throw new Error('Method not implemented.');
  }
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new route.
   * @param {RutaValidateDto} routeData - The data for the new route.
   * @returns {Promise<{ message: string, data: any }>} - A promise that resolves to an object containing the success message and the created route data.
   */
  async createRoute({
    salida,
    llegada,
    fecha_hora,
    puerta,
    precio_adulto,
    precio_nino,
    precio_tercera_edad,
    
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
          cantidad_boletos: 30
        },
      });
      if (!data) {
        throw new HttpException(
          {
            messageError:  'Error creating route',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return { message: 'Route created successfully', data };
    } catch (error) {
      return { message: 'Error creating route', error };
    }
  }

  /**
   * Retrieves all routes.
   * @returns {Promise<{ message: string, data: any[] }>} The result of the operation, including a message and the retrieved routes.
   * @throws {HttpException} If no routes are found.
   */
  async getRoutes() {
    try {
      const data = await this.prisma.ruta.findMany();
      if (!data || data.length === 0) {
        throw new HttpException(
          {
            messageError:  'No routes found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return { message: 'Routes found', data };
    } catch (error) {
      return { message: 'Error fetching routes', error };
    }
  }

  /**
   * Retrieves a route by its ID.
   * @param id - The ID of the route to retrieve.
   * @returns A promise that resolves to an object containing a message and the route data if found, or an error message if not found.
   */
  async getRouteById(id: string) {
    try {
      const data = await this.prisma.ruta.findUnique({
        where: { rutaId: Number(id) },
      });
      if (!data) {
        throw new HttpException(
          {
            messageError:  'Route not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return { message: 'Route found', data };
    } catch (error) {
      return { message: 'Error fetching route', error };
    }
  }

  /**
   * Updates a route with the specified ID.
   * @param id - The ID of the route to update.
   * @param data - The updated data for the route.
   * @returns An object containing a message and the updated route data if successful, or an error message if unsuccessful.
   */
  async updateRoute(id: string, data: RutaValidateDto) {
    try {
      const route = await this.prisma.ruta.findUnique({
        where: { rutaId: Number(id) },
      });
      if (!route) {
        throw new HttpException(
          {
            messageError:  'Route not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const { ...updateData } = data;
      const updatedRoute = await this.prisma.ruta.update({
        where: { rutaId: Number(id) },
        data: { ...updateData },
      });
      return { message: 'Route updated successfully', data: updatedRoute };
    } catch (error) {
      return { message: 'Error updating route', error };
    }
  }

  /**
   * Deletes a route with the specified ID.
   * @param id - The ID of the route to delete.
   * @returns A message indicating the result of the deletion operation.
   */
  async deleteRoute(id: string) {
    try {
      const route = await this.prisma.ruta.findUnique({
        where: { rutaId: Number(id) },
      });
      if (!route) {
        throw new HttpException(
          {
            messageError: 'Route not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      await this.prisma.ruta.delete({
        where: { rutaId: Number(id) },
      });
      return { message: 'Route deleted successfully' };
    } catch (error) {
      return { message: 'Error deleting route', error };
    }
  }

  async findRouteByOriginAndDestination(origin: string, destination: string) {
    try {
      const data = await this.prisma.ruta.findMany({
        where: {
          salida: origin,
          llegada: destination,
        },
        select: {
          rutaId: true,
          puerta: true,
          fecha_hora: true,
          salida: true,
          llegada: true,
        }
      });
      if (!data || data.length === 0) {
        throw new HttpException(
          {
            messageError: 'Route not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return { message: 'Route found', data };
    } catch (error) {
      return { message: 'Error fetching route', error };
    }
  }
}
