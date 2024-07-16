import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketDto } from './dto/ticket-validate.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new ticket.
   * @param {TicketDto} ticketData - The ticket data.
   * @returns {Promise<{ message: string, ticket: Ticket }>} The created ticket and a success message.
   * @throws {HttpException} If there is an error creating the ticket.
   */
  async createTicket({
    rutaId,
    cantidad_adulto,
    cantidad_nino,
    cantidad_tercera_edad,
  }: TicketDto) {

    const ruta = await this.prisma.ruta.findUnique({
      where: {
        rutaId: rutaId
      }
    });

    if (!ruta) {
      throw new HttpException(
        {
          messageError: 'Route not found',
        },
        HttpStatus.NOT_FOUND
      );
    }

    const totalTicketsRequested = cantidad_adulto + cantidad_nino + cantidad_tercera_edad;

    if(!ruta || ruta.cantidad_boletos < totalTicketsRequested) {
      throw new HttpException(
        {
          messageError: 'There are not enough tickets available',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const totalPrice = (Number(cantidad_adulto) * Number(ruta.precio_adulto)) +
        (Number(cantidad_nino) * Number(ruta.precio_nino)) +
        (Number(cantidad_tercera_edad) * Number(ruta.precio_tercera_edad));

    try {
      const ticket = await this.prisma.boleto.create({
        data: {
          rutaId,
          cantidad_adulto,
          cantidad_nino,
          cantidad_tercera_edad,
          proceso_compra: 'reservado',
          totalPrice: totalPrice
        },
      });
      await this.prisma.ruta.update({
        where: {
          rutaId: rutaId
        },
        data: {
          cantidad_boletos: {decrement: totalTicketsRequested}
        }
      }) // Update the route to decrease the number of available tickets
      if (!ticket) {
        throw new HttpException(
          {
            messageError: 'Error creating ticket',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return { message: 'Ticket created successfully', ticket , totalPrice};
    } catch (error) {
      return { message: 'Error creating ticket', error };
    }
  }
  @Cron('0 * * * * *')
  async resetExpiredTickets() {
    const expirationTime = new Date(Date.now() - 3600000); // 1 hora

    await this.prisma.boleto.deleteMany({
      where: {
        proceso_compra: 'reservado',
        createdAt: {
          lte: expirationTime
        },
      },
    }) 

  }

  /**
   * Retrieves all tickets.
   * @returns {Promise<{ message: string, error: any }>} The result of the operation, including any error that occurred.
   */
  async getTickets() {
    try {
      const tickets = await this.prisma.boleto.findMany();
      if (!tickets) {
        throw new HttpException(
          {
            messageError: 'Error getting tickets',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return { message: 'Tickets found', tickets };
    } catch (error) {
      return { message: 'Error getting tickets', error };
    }
  }

  /**
   * Retrieves a ticket by its ID.
   * @param id - The ID of the ticket to retrieve.
   * @returns A Promise that resolves to the retrieved ticket, or an error object if the ticket is not found.
   */
  async getTicketById(id: string) {
    try {
      const ticket = await this.prisma.boleto.findUnique({
        where: {
          boletoId: Number(id),
        },
      });
      
      if (!ticket) {
        throw new HttpException(
          {
            messageError: 'Error getting ticket',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return { message: 'Ticket found', ticket };
    } catch (error) {
      return { message: 'Error getting ticket', error };
    }
  }

  /**
   * Updates a ticket with the specified ID.
   * @param id - The ID of the ticket to update.
   * @param ticketData - The data to update the ticket with.
   * @returns A promise that resolves to the updated ticket if successful, or an error object if an error occurs.
   */
  async updateTicket(id: string, ticketData: TicketDto) {
    try {
      const ticket = await this.prisma.boleto.update({
        where: {
          boletoId: Number(id),
        },
        data: {
          rutaId: ticketData.rutaId,
          cantidad_adulto: ticketData.cantidad_adulto,
          cantidad_nino: ticketData.cantidad_nino,
          cantidad_tercera_edad: ticketData.cantidad_tercera_edad,
        },
      });
      if (!ticket) {
        throw new HttpException(
          {
            messageError: 'Error updating ticket',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      return { message: 'Error updating ticket', error };
    }
  }

  /**
   * Deletes a ticket with the specified ID.
   * @param id - The ID of the ticket to delete.
   * @returns A promise that resolves to the deleted ticket, or an object with an error message if an error occurs.
   */
  async deleteTicket(id: string) {
    try {
      const ticket = await this.prisma.boleto.delete({
        where: {
          boletoId: Number(id),
        },
      });
      if (!ticket) {
        throw new HttpException(
          {
            messageError: 'Error deleting ticket',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      return { message: 'Error deleting ticket', error };
    }
  }

  //Get tickets from a specific user using the user ID
  async getTicketsByUserId(userId: number) {
    try {
      const tickets = await this.prisma.boleto.findMany({
        where: {
          compras: {
            some: {
              userId: userId,
            },
          },
        },
        select: {
          totalPrice: true,
          ruta: {
            select: {
              fecha_hora: true,
              salida: true,
              llegada: true,
            },
          },
          compras: {
            where: {
              userId: userId,
            },
            select: {
              qrCode: true,
            },
          },
        },
      });

      // Transform the data to include only the necessary fields in the desired format
      return tickets.map(ticket => ({
        totalPrice: ticket.totalPrice,
        fecha_hora: ticket.ruta.fecha_hora,
        salida: ticket.ruta.salida,
        llegada: ticket.ruta.llegada,
        qrCode: ticket.compras[0].qrCode, // Assuming each ticket has only one purchase per user
      }));
    } catch (error) {
      throw new Error(`Error fetching tickets for user with ID ${userId}: ${error.message}`);
    }
  }
}
